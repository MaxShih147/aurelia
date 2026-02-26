export interface RecentFile {
  path: string;
  name: string;
  modified: number; // unix timestamp
}

export interface FileState {
  path: string | null;
  content: string;
  savedContent: string;
  isDirty: boolean;
}
