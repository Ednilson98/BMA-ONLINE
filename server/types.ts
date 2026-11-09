export interface Exercise {
  id: string;
  class: string;
  unit: string;
  title: string;
  kind: string;
  instr: string;
  content?: any;
  views?: number;
  [key: string]: any;
}

export interface BookMeta {
  format: 'bma-book-v1';
  book_id: string;
  title: string;
  subtitle?: string;
  footer?: string;
  author?: string;
  edition?: string;
  [key: string]: any;
}

export interface BookVersion {
  version: number;
  timestamp: string;
  exerciseCount: number;
  exercises: Exercise[];
  uploadedBy?: string;
  note?: string;
}

export interface BookRecord {
  book_id: string;
  meta: BookMeta;
  activeExercises: Exercise[];
  unlistedExercises: Exercise[]; // exercises kept even if missing from newest upload
  versions: BookVersion[];
  createdAt: string;
  updatedAt: string;
  totalViews: number;
  audioFiles: string[];
}

export interface AppMetadata {
  books: Record<string, BookRecord>;
  customDomain?: string;
  adminPasswordHash?: string;
}
