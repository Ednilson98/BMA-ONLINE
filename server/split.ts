import { BookMeta, Exercise } from './types.js';

export interface ParseBookResult {
  valid: boolean;
  errors: string[];
  meta?: BookMeta;
  exercises?: Exercise[];
  rawJson?: string;
  hasAudioFolder?: boolean;
}

// Regex to locate the JSON block inside <script type="application/json" id="bma-book">...</script>
const SCRIPT_REGEX = /(<script\b[^>]*\bid=["']bma-book["'][^>]*>)([\s\S]*?)(<\/script>)/i;

/**
 * Validates a slug: lowercase letters, numbers, hyphens
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Validates the uploaded HTML content and extracts its metadata and exercises
 */
export function validateAndParseBookHtml(htmlContent: string): ParseBookResult {
  const errors: string[] = [];
  const match = htmlContent.match(SCRIPT_REGEX);

  if (!match) {
    errors.push('Não foi encontrado o bloco obrigatório: <script type="application/json" id="bma-book">...</script>');
    return { valid: false, errors };
  }

  const rawJson = match[2].trim();
  let parsed: any;

  try {
    parsed = JSON.parse(rawJson);
  } catch (err: any) {
    errors.push(`JSON inválido dentro do bloco bma-book: ${err.message || 'Erro de sintaxe'}`);
    return { valid: false, errors, rawJson };
  }

  if (!parsed || typeof parsed !== 'object') {
    errors.push('O conteúdo JSON deve ser um objecto com "meta" e "exercises".');
    return { valid: false, errors };
  }

  // Validate meta
  if (!parsed.meta || typeof parsed.meta !== 'object') {
    errors.push('O bloco "meta" é obrigatório no ficheiro JSON.');
  } else {
    if (parsed.meta.format !== 'bma-book-v1') {
      errors.push(`Formato inválido: esperado "bma-book-v1", recebido "${parsed.meta.format || 'nenhum'}"`);
    }
    if (!parsed.meta.book_id || typeof parsed.meta.book_id !== 'string') {
      errors.push('O campo "meta.book_id" é obrigatório.');
    } else if (!isValidSlug(parsed.meta.book_id)) {
      errors.push(`O book_id "${parsed.meta.book_id}" é inválido. Utilize apenas letras minúsculas, números e hífens.`);
    }

    if (!parsed.meta.title || typeof parsed.meta.title !== 'string') {
      errors.push('O campo "meta.title" é obrigatório.');
    }
  }

  // Validate exercises
  if (!Array.isArray(parsed.exercises)) {
    errors.push('O campo "exercises" deve ser uma lista (array) de exercícios.');
  } else if (parsed.exercises.length === 0) {
    errors.push('O livro não contém nenhum exercício na lista "exercises".');
  } else {
    const seenIds = new Set<string>();
    parsed.exercises.forEach((ex: any, index: number) => {
      const pos = index + 1;
      if (!ex || typeof ex !== 'object') {
        errors.push(`Exercício #${pos} não é um objecto válido.`);
        return;
      }

      if (!ex.id || typeof ex.id !== 'string') {
        errors.push(`Exercício #${pos} não tem "id" válido.`);
      } else {
        if (!isValidSlug(ex.id)) {
          errors.push(`Exercício #${pos} com id "${ex.id}" inválido. Utilize apenas letras minúsculas, números e hífens.`);
        }
        if (seenIds.has(ex.id)) {
          errors.push(`ID duplicado detectado: "${ex.id}" (exercício #${pos}). Cada id deve ser único.`);
        }
        seenIds.add(ex.id);
      }

      if (!ex.title) {
        errors.push(`Exercício #${pos} ("${ex.id || 'sem id'}") deve ter um "title".`);
      }
      if (!ex.class) {
        // default or warning
      }
      if (!ex.unit) {
        // default or warning
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors, rawJson };
  }

  return {
    valid: true,
    errors: [],
    meta: parsed.meta as BookMeta,
    exercises: parsed.exercises as Exercise[],
    rawJson
  };
}

/**
 * Generates a standalone page for one exercise via plain-text substitution.
 * Replaces the JSON block in the uploaded HTML with:
 * { "meta": <same meta>, "exercises": [ <only this exercise> ] }
 * Escapes "</" as "<\/" inside the JSON to prevent prematurely terminating the <script> tag.
 * Does NOT parse or alter any other part of the HTML document.
 */
export function generateExerciseHtml(
  originalHtml: string,
  meta: BookMeta,
  exercise: Exercise
): string {
  const match = originalHtml.match(SCRIPT_REGEX);
  if (!match) {
    throw new Error('Script bma-book block not found in original HTML');
  }

  const singleExercisePayload = {
    meta,
    exercises: [exercise]
  };

  // Safely serialize and escape </ to <\/ as required by the specification
  const jsonString = JSON.stringify(singleExercisePayload, null, 2).replace(/<\//g, '<\\/');

  // Substitute exactly the inner JSON content within the <script> tags
  const prefix = originalHtml.substring(0, match.index! + match[1].length);
  const suffix = originalHtml.substring(match.index! + match[1].length + match[2].length);

  return `${prefix}\n${jsonString}\n${suffix}`;
}

/**
 * Generates a book index page containing all active exercises.
 * If activeExercises is provided and differs from original, replaces the JSON block.
 * Otherwise originalHtml is returned intact.
 */
export function generateBookIndexHtml(
  originalHtml: string,
  meta: BookMeta,
  activeExercises?: Exercise[]
): string {
  if (!activeExercises) {
    return originalHtml;
  }

  const match = originalHtml.match(SCRIPT_REGEX);
  if (!match) {
    return originalHtml;
  }

  const fullPayload = {
    meta,
    exercises: activeExercises
  };

  const jsonString = JSON.stringify(fullPayload, null, 2).replace(/<\//g, '<\\/');
  const prefix = originalHtml.substring(0, match.index! + match[1].length);
  const suffix = originalHtml.substring(match.index! + match[1].length + match[2].length);

  return `${prefix}\n${jsonString}\n${suffix}`;
}
