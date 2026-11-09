import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.js';
import { generateBookIndexHtml, generateExerciseHtml, validateAndParseBookHtml } from './server/split.js';
import { buildSampleBookHtml, SAMPLE_BOOK_ID } from './server/sampleBook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Increase payload limits for book uploads (up to 10MB html, 100MB zip)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Setup Multer storage in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});

// Admin credentials & rate limiting
const DEFAULT_ADMIN_EMAIL = 'bantudesignstudio9@gmail.com';
const SECONDARY_ADMIN_EMAIL = 'admin@bmabooks.ao';
let currentAdminPassword = process.env.ADMIN_PASSWORD || 'bma-docente-2026';

// In-memory rate limiting for login
interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
}
const loginRateLimits = new Map<string, RateLimitEntry>();

// Simple Bearer token store
const validTokens = new Set<string>();
function generateToken(): string {
  return 'bma_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Auth Middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sessão não autorizada. Por favor, inicie sessão como docente.' });
    return;
  }
  const token = authHeader.substring(7);
  if (!validTokens.has(token)) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, aceda novamente.' });
    return;
  }
  next();
}

// Reserved paths that should never be treated as book IDs
const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'assets',
  'src',
  'public',
  'node_modules',
  'favicon.ico',
  'robots.txt',
  '@vite',
  '@fs',
  '@id'
]);

// Helper to determine host URL
function getBaseUrl(req: Request): string {
  const custom = storage.getCustomDomain();
  if (custom) {
    return custom.startsWith('http') ? custom : `https://${custom}`;
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || `localhost:${PORT}`;
  const proto = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${proto}://${host}`;
}

// ========================================================
// 1. PUBLIC TOP-LEVEL BOOK & EXERCISE ROUTES (NO AUTH, NO IFRAME)
// ========================================================

// Audio file route: /<book_id>/audio/<file>
app.get('/:book_id/audio/:file', (req: Request, res: Response, next: NextFunction) => {
  const { book_id, file } = req.params;
  if (RESERVED_SLUGS.has(book_id)) return next();

  const filePath = storage.getAudioFilePath(book_id, file);
  if (filePath) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Ficheiro áudio não encontrado.');
  }
});

// Single Exercise route: /<book_id>/<exercise_id>
app.get('/:book_id/:exercise_id', (req: Request, res: Response, next: NextFunction) => {
  const { book_id, exercise_id } = req.params;

  // Skip reserved routes or vite files
  if (RESERVED_SLUGS.has(book_id) || exercise_id.includes('.') || exercise_id.startsWith('@')) {
    return next();
  }

  const book = storage.getBook(book_id);
  if (!book) {
    return next();
  }

  // Look for exercise in active or unlisted list
  const exercise = book.activeExercises.find(e => e.id === exercise_id) ||
                   book.unlistedExercises.find(e => e.id === exercise_id);

  if (!exercise) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exercício Não Encontrado - BMA Books</title>
        <style>
          body { font-family: sans-serif; background: #0B1B2B; color: #F8FAFC; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
          .card { background: #132438; border-radius: 18px; padding: 32px; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h2 { color: #F59E0B; margin-bottom: 12px; }
          p { color: #94A3B8; margin-bottom: 24px; font-size: 15px; }
          a { display: inline-block; background: #0D9488; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Exercício Não Encontrado</h2>
          <p>O exercício <strong>"${exercise_id}"</strong> não foi encontrado no livro <strong>"${book.meta.title}"</strong>. Verifique se o código QR ou URL foi digitado correctamente.</p>
          <a href="/${book_id}">Ver Índice do Livro</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Increment view counter
  storage.incrementExerciseView(book_id, exercise_id);

  const originalHtml = storage.getBookHtml(book_id);
  if (!originalHtml) {
    res.status(500).send('Erro ao carregar o HTML base do livro.');
    return;
  }

  try {
    const standaloneHtml = generateExerciseHtml(originalHtml, book.meta, exercise);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(standaloneHtml);
  } catch (err: any) {
    console.error('Error generating exercise page:', err);
    res.status(500).send(`Erro ao gerar página do exercício: ${err.message}`);
  }
});

// Book Index route: /<book_id>
app.get('/:book_id', (req: Request, res: Response, next: NextFunction) => {
  const { book_id } = req.params;

  if (RESERVED_SLUGS.has(book_id) || book_id.includes('.') || book_id.startsWith('@')) {
    return next();
  }

  const book = storage.getBook(book_id);
  if (!book) {
    return next();
  }

  const originalHtml = storage.getBookHtml(book_id);
  if (!originalHtml) {
    return next();
  }

  try {
    const indexHtml = generateBookIndexHtml(originalHtml, book.meta, book.activeExercises);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(indexHtml);
  } catch (err: any) {
    console.error('Error generating book index page:', err);
    res.status(500).send(`Erro ao gerar índice do livro: ${err.message}`);
  }
});

// ========================================================
// 2. API ROUTES
// ========================================================

// Login endpoint with rate-limiting
app.post('/api/auth/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { email, password } = req.body;

  const now = Date.now();
  const entry = loginRateLimits.get(ip) || { attempts: 0, lockedUntil: 0 };

  if (entry.lockedUntil > now) {
    const waitSec = Math.ceil((entry.lockedUntil - now) / 1000);
    res.status(429).json({
      error: `Demasiadas tentativas de início de sessão. Por favor aguarde ${waitSec} segundos.`
    });
    return;
  }

  const isEmailMatch = (
    email === DEFAULT_ADMIN_EMAIL ||
    email === SECONDARY_ADMIN_EMAIL ||
    email === 'docente@bma.ao'
  );

  const isPassMatch = (password === currentAdminPassword);

  if (isEmailMatch && isPassMatch) {
    // Reset rate limiter on success
    loginRateLimits.delete(ip);
    const token = generateToken();
    validTokens.add(token);
    res.json({
      success: true,
      token,
      email,
      name: 'Professor Bantu Mentor Academy'
    });
  } else {
    entry.attempts += 1;
    if (entry.attempts >= 5) {
      entry.lockedUntil = now + 2 * 60 * 1000; // 2 minutes block
      loginRateLimits.set(ip, entry);
      res.status(429).json({
        error: 'Limite de 5 tentativas excedido. Acesso bloqueado durante 2 minutos por razões de segurança.'
      });
    } else {
      loginRateLimits.set(ip, entry);
      const remaining = 5 - entry.attempts;
      res.status(401).json({
        error: `Credenciais incorrectas. Restam ${remaining} tentativas antes do bloqueio temporário.`
      });
    }
  }
});

// Validate auth token
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const token = authHeader.substring(7);
  if (validTokens.has(token)) {
    res.json({
      authenticated: true,
      email: DEFAULT_ADMIN_EMAIL,
      name: 'Professor BMA'
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    validTokens.delete(token);
  }
  res.json({ success: true });
});

// Change admin password
app.post('/api/auth/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword !== currentAdminPassword) {
    res.status(400).json({ error: 'A palavra-passe actual está incorrecta.' });
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
    return;
  }
  currentAdminPassword = newPassword;
  res.json({ success: true, message: 'Palavra-passe actualizada com sucesso.' });
});

// List all books (public summary)
app.get('/api/books', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  const books = storage.getBooks().map(b => ({
    book_id: b.book_id,
    title: b.meta.title,
    subtitle: b.meta.subtitle,
    footer: b.meta.footer,
    author: b.meta.author,
    edition: b.meta.edition,
    activeExerciseCount: b.activeExercises.length,
    unlistedExerciseCount: b.unlistedExercises.length,
    versionCount: b.versions.length,
    latestVersion: b.versions[0]?.version || 1,
    totalViews: b.totalViews || 0,
    updatedAt: b.updatedAt,
    publicUrl: `${baseUrl}/${b.book_id}`
  }));
  res.json({ books });
});

// Get book details (with exercises and full URLs)
app.get('/api/books/:book_id', (req: Request, res: Response) => {
  const { book_id } = req.params;
  const book = storage.getBook(book_id);
  if (!book) {
    res.status(404).json({ error: `Livro "${book_id}" não encontrado.` });
    return;
  }

  const baseUrl = getBaseUrl(req);
  const publicBookUrl = `${baseUrl}/${book.book_id}`;

  const activeWithUrls = book.activeExercises.map(ex => ({
    ...ex,
    url: `${baseUrl}/${book.book_id}/${ex.id}`
  }));

  const unlistedWithUrls = book.unlistedExercises.map(ex => ({
    ...ex,
    url: `${baseUrl}/${book.book_id}/${ex.id}`,
    isUnlisted: true
  }));

  res.json({
    book: {
      ...book,
      publicUrl: publicBookUrl,
      activeExercises: activeWithUrls,
      unlistedExercises: unlistedWithUrls
    }
  });
});

// Validate HTML file before publish
app.post(
  '/api/books/validate',
  requireAdminAuth,
  upload.fields([{ name: 'htmlFile', maxCount: 1 }]),
  (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files?.htmlFile?.[0]) {
      res.status(400).json({ error: 'Nenhum ficheiro .html foi enviado para validação.' });
      return;
    }

    const htmlBuffer = files.htmlFile[0].buffer;
    const htmlString = htmlBuffer.toString('utf-8');
    const parseResult = validateAndParseBookHtml(htmlString);

    if (!parseResult.valid) {
      res.status(400).json({
        valid: false,
        errors: parseResult.errors
      });
      return;
    }

    const existingBook = storage.getBook(parseResult.meta!.book_id);
    let missingFromExisting: string[] = [];
    if (existingBook) {
      const newIdsSet = new Set(parseResult.exercises!.map(e => e.id));
      missingFromExisting = existingBook.activeExercises
        .filter(e => !newIdsSet.has(e.id))
        .map(e => e.id);
    }

    res.json({
      valid: true,
      meta: parseResult.meta,
      exerciseCount: parseResult.exercises?.length || 0,
      exercisesPreview: parseResult.exercises?.slice(0, 50),
      isUpdate: !!existingBook,
      missingFromExisting,
      hasAudioFolder: parseResult.hasAudioFolder || false
    });
  }
);

// Publish or Update Book (Upload HTML + optional audio ZIP)
app.post(
  '/api/books/upload',
  requireAdminAuth,
  upload.fields([
    { name: 'htmlFile', maxCount: 1 },
    { name: 'zipFile', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files?.htmlFile?.[0]) {
        res.status(400).json({ error: 'O ficheiro .html do livro é obrigatório.' });
        return;
      }

      const htmlBuffer = files.htmlFile[0].buffer;
      const htmlString = htmlBuffer.toString('utf-8');
      const parseResult = validateAndParseBookHtml(htmlString);

      if (!parseResult.valid || !parseResult.meta || !parseResult.exercises) {
        res.status(400).json({
          valid: false,
          errors: parseResult.errors
        });
        return;
      }

      const unpublishMissing = req.body.unpublishMissing === 'unpublish' ? 'unpublish' : 'keep-missing';
      const note = req.body.note || '';

      // Check if ZIP was also uploaded
      let audioAdded: string[] = [];
      if (files.zipFile?.[0]) {
        const zipBuffer = files.zipFile[0].buffer;
        audioAdded = await storage.extractAudioZip(parseResult.meta.book_id, zipBuffer);
      }

      const result = storage.saveBookUpload(
        parseResult.meta,
        parseResult.exercises,
        htmlString,
        audioAdded,
        note,
        unpublishMissing
      );

      const baseUrl = getBaseUrl(req);

      res.json({
        success: true,
        book_id: result.book.book_id,
        publicUrl: `${baseUrl}/${result.book.book_id}`,
        missingIds: result.missingIds,
        newIds: result.newIds,
        updatedIds: result.updatedIds,
        audioFilesCount: result.book.audioFiles.length,
        version: result.book.versions[0]?.version || 1
      });
    } catch (err: any) {
      console.error('Upload book error:', err);
      res.status(500).json({ error: `Erro no processamento do livro: ${err.message}` });
    }
  }
);

// Restore a book version
app.post('/api/books/:book_id/restore', requireAdminAuth, (req: Request, res: Response) => {
  const { book_id } = req.params;
  const { version } = req.body;

  if (!version || typeof version !== 'number') {
    res.status(400).json({ error: 'Número de versão inválido.' });
    return;
  }

  try {
    const updatedBook = storage.restoreVersion(book_id, version);
    res.json({
      success: true,
      message: `Livro restaurado com sucesso para a Versão ${version}.`,
      book: updatedBook
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete or unpublish exercise
app.delete('/api/books/:book_id/exercises/:exercise_id', requireAdminAuth, (req: Request, res: Response) => {
  const { book_id, exercise_id } = req.params;
  storage.unpublishExercise(book_id, exercise_id);
  res.json({ success: true, message: `Exercício "${exercise_id}" despublicado.` });
});

// Delete entire book
app.delete('/api/books/:book_id', requireAdminAuth, (req: Request, res: Response) => {
  const { book_id } = req.params;
  storage.deleteBook(book_id);
  res.json({ success: true, message: `Livro "${book_id}" removido com sucesso.` });
});

// Download original current HTML of a book
app.get('/api/books/:book_id/download-original', (req: Request, res: Response) => {
  const { book_id } = req.params;
  const html = storage.getBookHtml(book_id);
  if (!html) {
    res.status(404).send('Ficheiro original não encontrado.');
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${book_id}.html"`);
  res.send(html);
});

// Download sample book HTML file
app.get('/api/sample-book/download', (req: Request, res: Response) => {
  const sampleHtml = buildSampleBookHtml();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ingles-7-8.html"');
  res.send(sampleHtml);
});

// Reset sample book (for testing)
app.post('/api/sample-book/reset', requireAdminAuth, (req: Request, res: Response) => {
  storage.deleteBook(SAMPLE_BOOK_ID);
  storage.ensureSampleBook();
  res.json({ success: true, message: 'Livro de demonstração "ingles-7-8" reinicializado com sucesso.' });
});

// Custom domain get & set
app.get('/api/domain', (req: Request, res: Response) => {
  res.json({
    customDomain: storage.getCustomDomain(),
    currentHost: req.get('host'),
    effectiveBaseUrl: getBaseUrl(req)
  });
});

app.post('/api/domain', requireAdminAuth, (req: Request, res: Response) => {
  const { customDomain } = req.body;
  storage.setCustomDomain(customDomain || '');
  res.json({
    success: true,
    customDomain: storage.getCustomDomain(),
    effectiveBaseUrl: getBaseUrl(req)
  });
});

// QR Code generation endpoint: SVG or PNG
app.get('/api/qr/:book_id/:exercise_id', async (req: Request, res: Response) => {
  const { book_id, exercise_id } = req.params;
  const format = req.query.format === 'svg' ? 'svg' : 'png';
  const download = req.query.download === 'true';

  const baseUrl = getBaseUrl(req);
  const targetUrl = `${baseUrl}/${book_id}/${exercise_id}`;

  try {
    if (format === 'svg') {
      const svg = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#0B1B2B',
          light: '#FFFFFF'
        }
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      if (download) {
        res.setHeader('Content-Disposition', `attachment; filename="qr-${book_id}-${exercise_id}.svg"`);
      }
      res.send(svg);
    } else {
      const pngBuffer = await QRCode.toBuffer(targetUrl, {
        type: 'png',
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0B1B2B',
          light: '#FFFFFF'
        }
      });
      res.setHeader('Content-Type', 'image/png');
      if (download) {
        res.setHeader('Content-Disposition', `attachment; filename="qr-${book_id}-${exercise_id}.png"`);
      }
      res.send(pngBuffer);
    }
  } catch (err: any) {
    res.status(500).send(`Erro ao gerar código QR: ${err.message}`);
  }
});

// ========================================================
// 3. VITE MIDDLEWARE & FRONTEND INTEGRATION
// ========================================================

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BMA Books server running on port ${PORT} (isProd: ${isProd})`);
  });
}

startServer();
