import { BookDetail, BookSummary, ValidationResult } from './types.js';

const TOKEN_KEY = 'bma_admin_token';
const ADMIN_USER_KEY = 'bma_admin_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, user?: { email: string; name: string }): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getStoredAdminUser(): { email: string; name: string } | null {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchBooks(): Promise<BookSummary[]> {
  const res = await fetch('/api/books');
  if (!res.ok) throw new Error('Falha ao carregar lista de livros');
  const data = await res.json();
  return data.books || [];
}

export async function fetchBookDetail(book_id: string): Promise<BookDetail> {
  const res = await fetch(`/api/books/${book_id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Livro ${book_id} não encontrado`);
  }
  const data = await res.json();
  return data.book;
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; email: string; name: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Falha no início de sessão');
  }

  setStoredToken(data.token, { email: data.email, name: data.name });
  return data;
}

export async function checkAuth(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } finally {
    clearStoredToken();
  }
}

export async function validateBookHtml(htmlFile: File): Promise<ValidationResult> {
  const formData = new FormData();
  formData.append('htmlFile', htmlFile);

  const res = await fetch('/api/books/validate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });

  const data = await res.json();
  if (!res.ok && !data.errors) {
    throw new Error(data.error || 'Erro ao validar ficheiro');
  }
  return data;
}

export async function uploadBook(
  htmlFile: File,
  zipFile: File | null,
  note: string,
  unpublishMissing: 'keep-missing' | 'unpublish'
): Promise<any> {
  const formData = new FormData();
  formData.append('htmlFile', htmlFile);
  if (zipFile) {
    formData.append('zipFile', zipFile);
  }
  formData.append('note', note);
  formData.append('unpublishMissing', unpublishMissing);

  const res = await fetch('/api/books/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.errors?.join('\n') || 'Falha no envio do livro');
  }
  return data;
}

export async function restoreBookVersion(book_id: string, version: number): Promise<BookDetail> {
  const res = await fetch(`/api/books/${book_id}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ version })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha ao restaurar versão');
  return data.book;
}

export async function deleteExercise(book_id: string, exercise_id: string): Promise<void> {
  const res = await fetch(`/api/books/${book_id}/exercises/${exercise_id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao despublicar exercício');
  }
}

export async function deleteBook(book_id: string): Promise<void> {
  const res = await fetch(`/api/books/${book_id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao eliminar livro');
  }
}

export async function resetSampleBook(): Promise<void> {
  const res = await fetch('/api/sample-book/reset', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao reiniciar livro de exemplo');
}

export async function fetchDomainInfo(): Promise<{ customDomain: string; currentHost: string; effectiveBaseUrl: string }> {
  const res = await fetch('/api/domain');
  if (!res.ok) throw new Error('Falha ao obter configurações de domínio');
  return res.json();
}

export async function saveCustomDomain(customDomain: string): Promise<{ customDomain: string; effectiveBaseUrl: string }> {
  const res = await fetch('/api/domain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ customDomain })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha ao guardar domínio personalizado');
  return data;
}
