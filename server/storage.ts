import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { AppMetadata, BookMeta, BookRecord, BookVersion, Exercise } from './types.js';
import { buildSampleBookHtml, SAMPLE_BOOK_ID, SAMPLE_BOOK_META, SAMPLE_EXERCISES } from './sampleBook.js';
import { validateAndParseBookHtml } from './split.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BOOKS_DIR = path.join(DATA_DIR, 'books');
const META_FILE = path.join(DATA_DIR, 'metadata.json');

// Ensure base directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BOOKS_DIR)) {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
}

export class StorageService {
  private metadata: AppMetadata = {
    books: {},
    customDomain: ''
  };

  constructor() {
    this.loadMetadata();
  }

  private loadMetadata() {
    if (fs.existsSync(META_FILE)) {
      try {
        const raw = fs.readFileSync(META_FILE, 'utf-8');
        this.metadata = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading metadata.json, creating new one:', err);
        this.metadata = { books: {}, customDomain: '' };
        this.saveMetadata();
      }
    } else {
      this.metadata = { books: {}, customDomain: '' };
      this.saveMetadata();
    }
  }

  private saveMetadata() {
    try {
      fs.writeFileSync(META_FILE, JSON.stringify(this.metadata, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving metadata.json:', err);
    }
  }

  private getBookDir(book_id: string): string {
    const dir = path.join(BOOKS_DIR, book_id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const audioDir = path.join(dir, 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    const versionsDir = path.join(dir, 'versions');
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
    }
    return dir;
  }

  public getBooks(): BookRecord[] {
    return Object.values(this.metadata.books);
  }

  public getBook(book_id: string): BookRecord | undefined {
    return this.metadata.books[book_id];
  }

  public getBookHtml(book_id: string): string | null {
    const bookDir = path.join(BOOKS_DIR, book_id);
    const htmlPath = path.join(bookDir, 'current.html');
    if (fs.existsSync(htmlPath)) {
      return fs.readFileSync(htmlPath, 'utf-8');
    }
    return null;
  }

  public getVersionHtml(book_id: string, versionNum: number): string | null {
    const bookDir = path.join(BOOKS_DIR, book_id);
    const htmlPath = path.join(bookDir, 'versions', `v${versionNum}.html`);
    if (fs.existsSync(htmlPath)) {
      return fs.readFileSync(htmlPath, 'utf-8');
    }
    return null;
  }

  public getAudioFilePath(book_id: string, filename: string): string | null {
    const safeFilename = path.basename(filename);
    const filePath = path.join(BOOKS_DIR, book_id, 'audio', safeFilename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  public getCustomDomain(): string {
    return this.metadata.customDomain || '';
  }

  public setCustomDomain(domain: string): void {
    this.metadata.customDomain = domain.trim();
    this.saveMetadata();
  }

  public incrementExerciseView(book_id: string, exercise_id: string): void {
    const book = this.metadata.books[book_id];
    if (!book) return;

    book.totalViews = (book.totalViews || 0) + 1;
    const ex = book.activeExercises.find(e => e.id === exercise_id);
    if (ex) {
      ex.views = (ex.views || 0) + 1;
    } else {
      const unlisted = book.unlistedExercises.find(e => e.id === exercise_id);
      if (unlisted) {
        unlisted.views = (unlisted.views || 0) + 1;
      }
    }
    this.saveMetadata();
  }

  /**
   * Saves a new book or updates an existing book
   * @param unpublishMissing 'keep-missing' (recommended) or 'unpublish'
   */
  public saveBookUpload(
    meta: BookMeta,
    newExercises: Exercise[],
    htmlContent: string,
    audioFilesAdded: string[] = [],
    note?: string,
    unpublishMissing: 'keep-missing' | 'unpublish' = 'keep-missing'
  ): { book: BookRecord; missingIds: string[]; newIds: string[]; updatedIds: string[] } {
    const bookDir = this.getBookDir(meta.book_id);
    const existingBook = this.metadata.books[meta.book_id];

    let missingIds: string[] = [];
    let newIds: string[] = [];
    let updatedIds: string[] = [];

    const now = new Date().toISOString();
    let nextVersionNum = 1;
    let versions: BookVersion[] = [];
    let audioList: string[] = [...audioFilesAdded];

    let activeExercises: Exercise[] = [];
    let unlistedExercises: Exercise[] = [];

    if (existingBook) {
      const existingIds = new Set(existingBook.activeExercises.map(e => e.id));
      const newIdsSet = new Set(newExercises.map(e => e.id));

      // Check which IDs are missing from the new file
      for (const ex of existingBook.activeExercises) {
        if (!newIdsSet.has(ex.id)) {
          missingIds.push(ex.id);
        } else {
          updatedIds.push(ex.id);
        }
      }

      for (const ex of newExercises) {
        if (!existingIds.has(ex.id)) {
          newIds.push(ex.id);
        }
      }

      nextVersionNum = (existingBook.versions[0]?.version || existingBook.versions.length) + 1;
      versions = [...(existingBook.versions || [])];

      // Merge audio files
      const existingAudioSet = new Set(existingBook.audioFiles || []);
      audioFilesAdded.forEach(f => existingAudioSet.add(f));
      audioList = Array.from(existingAudioSet);

      if (unpublishMissing === 'keep-missing') {
        // Keep missing exercises alive under unlistedExercises or keep them active!
        // To ensure printed QR codes NEVER break, we keep them so their URL remains functional
        const missingObjects = existingBook.activeExercises.filter(e => !newIdsSet.has(e.id));
        unlistedExercises = [...(existingBook.unlistedExercises || []), ...missingObjects];
        // Combine view counts for existing exercises
        activeExercises = newExercises.map(ne => {
          const prev = existingBook.activeExercises.find(e => e.id === ne.id);
          return {
            ...ne,
            views: prev?.views || 0
          };
        });
      } else {
        // Teacher explicitly requested unpublishing missing exercises
        activeExercises = newExercises.map(ne => {
          const prev = existingBook.activeExercises.find(e => e.id === ne.id);
          return {
            ...ne,
            views: prev?.views || 0
          };
        });
        unlistedExercises = [];
      }
    } else {
      newIds = newExercises.map(e => e.id);
      activeExercises = newExercises.map(e => ({ ...e, views: 0 }));
    }

    // Save version snapshot
    const newVersion: BookVersion = {
      version: nextVersionNum,
      timestamp: now,
      exerciseCount: newExercises.length,
      exercises: newExercises,
      note: note || (existingBook ? `Actualização para versão ${nextVersionNum}` : 'Publicação inicial')
    };

    // Keep last 5 versions
    versions.unshift(newVersion);
    if (versions.length > 5) {
      const removedVersions = versions.splice(5);
      // Clean up old version files if present
      for (const rv of removedVersions) {
        const oldFile = path.join(bookDir, 'versions', `v${rv.version}.html`);
        if (fs.existsSync(oldFile)) {
          try { fs.unlinkSync(oldFile); } catch (e) { /* ignore */ }
        }
      }
    }

    // Write version file and current.html
    const versionPath = path.join(bookDir, 'versions', `v${nextVersionNum}.html`);
    const currentPath = path.join(bookDir, 'current.html');
    fs.writeFileSync(versionPath, htmlContent, 'utf-8');
    fs.writeFileSync(currentPath, htmlContent, 'utf-8');

    const updatedBook: BookRecord = {
      book_id: meta.book_id,
      meta,
      activeExercises,
      unlistedExercises,
      versions,
      createdAt: existingBook?.createdAt || now,
      updatedAt: now,
      totalViews: existingBook?.totalViews || 0,
      audioFiles: audioList
    };

    this.metadata.books[meta.book_id] = updatedBook;
    this.saveMetadata();

    return {
      book: updatedBook,
      missingIds,
      newIds,
      updatedIds
    };
  }

  /**
   * Restores a previously saved version of a book
   */
  public restoreVersion(book_id: string, versionNum: number): BookRecord {
    const book = this.metadata.books[book_id];
    if (!book) {
      throw new Error(`Livro "${book_id}" não encontrado.`);
    }

    const targetVersion = book.versions.find(v => v.version === versionNum);
    if (!targetVersion) {
      throw new Error(`Versão ${versionNum} não encontrada para o livro "${book_id}".`);
    }

    const versionHtml = this.getVersionHtml(book_id, versionNum);
    if (!versionHtml) {
      throw new Error(`Ficheiro HTML da versão ${versionNum} não existe no disco.`);
    }

    const parseResult = validateAndParseBookHtml(versionHtml);
    if (!parseResult.valid || !parseResult.meta || !parseResult.exercises) {
      throw new Error('Falha ao re-validar o HTML da versão guardada.');
    }

    // Save as newest restored version
    const result = this.saveBookUpload(
      parseResult.meta,
      parseResult.exercises,
      versionHtml,
      [],
      `Restaurado da Versão ${versionNum}`,
      'keep-missing'
    );

    return result.book;
  }

  /**
   * Unpublishes an unlisted exercise or removes it
   */
  public unpublishExercise(book_id: string, exercise_id: string): void {
    const book = this.metadata.books[book_id];
    if (!book) return;

    book.activeExercises = book.activeExercises.filter(e => e.id !== exercise_id);
    book.unlistedExercises = book.unlistedExercises.filter(e => e.id !== exercise_id);
    this.saveMetadata();
  }

  /**
   * Deletes a book entirely
   */
  public deleteBook(book_id: string): void {
    if (this.metadata.books[book_id]) {
      delete this.metadata.books[book_id];
      this.saveMetadata();

      const bookDir = path.join(BOOKS_DIR, book_id);
      if (fs.existsSync(bookDir)) {
        try {
          fs.rmSync(bookDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`Failed to delete book directory ${bookDir}:`, err);
        }
      }
    }
  }

  /**
   * Unpack a ZIP file and copy audio files into book_id/audio/
   */
  public async extractAudioZip(book_id: string, zipBuffer: Buffer): Promise<string[]> {
    const bookDir = this.getBookDir(book_id);
    const audioDir = path.join(bookDir, 'audio');

    const zip = await JSZip.loadAsync(zipBuffer);
    const extractedFiles: string[] = [];

    const allowedExts = ['.mp3', '.ogg', '.wav', '.m4a', '.aac'];

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      const ext = path.extname(relativePath).toLowerCase();
      if (!allowedExts.includes(ext)) continue;

      const filename = path.basename(relativePath);
      const targetPath = path.join(audioDir, filename);

      const content = await zipEntry.async('nodebuffer');
      fs.writeFileSync(targetPath, content);
      extractedFiles.push(filename);
    }

    if (this.metadata.books[book_id]) {
      const currentAudio = new Set(this.metadata.books[book_id].audioFiles || []);
      extractedFiles.forEach(f => currentAudio.add(f));
      this.metadata.books[book_id].audioFiles = Array.from(currentAudio);
      this.saveMetadata();
    }

    return extractedFiles;
  }
}

export const storage = new StorageService();
