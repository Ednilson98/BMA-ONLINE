export interface Exercise {
  id: string;
  class: string;
  unit: string;
  title: string;
  kind: string;
  instr: string;
  url?: string;
  views?: number;
  isUnlisted?: boolean;
  content?: any;
  audio?: string;
  audioText?: string;
}

export interface BookMeta {
  format: 'bma-book-v1';
  book_id: string;
  title: string;
  subtitle?: string;
  footer?: string;
  author?: string;
  edition?: string;
}

export interface BookVersion {
  version: number;
  timestamp: string;
  exerciseCount: number;
  exercises?: Exercise[];
  note?: string;
}

export interface BookSummary {
  book_id: string;
  title: string;
  subtitle?: string;
  footer?: string;
  author?: string;
  edition?: string;
  activeExerciseCount: number;
  unlistedExerciseCount: number;
  versionCount: number;
  latestVersion: number;
  totalViews: number;
  updatedAt: string;
  publicUrl: string;
}

export interface BookDetail {
  book_id: string;
  meta: BookMeta;
  activeExercises: Exercise[];
  unlistedExercises: Exercise[];
  versions: BookVersion[];
  createdAt: string;
  updatedAt: string;
  totalViews: number;
  audioFiles: string[];
  publicUrl: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  meta?: BookMeta;
  exerciseCount?: number;
  exercisesPreview?: Exercise[];
  isUpdate?: boolean;
  missingFromExisting?: string[];
  hasAudioFolder?: boolean;
}
