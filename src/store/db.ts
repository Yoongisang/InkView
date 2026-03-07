import Dexie, { type Table } from 'dexie';

export interface UserBookmark {
  id: string;
  documentId: string; // SHA-256 hash of the PDF file (stable across sessions)
  pageIndex: number;  // 0-based
  title: string;
  color: string;      // hex color e.g. '#f59e0b'
  createdAt: number;
  updatedAt: number;
}

export class InkViewDB extends Dexie {
  userBookmarks!: Table<UserBookmark>;

  constructor() {
    super('InkViewDB');
    this.version(1).stores({
      userBookmarks: 'id, documentId, pageIndex',
    });
  }
}

export const db = new InkViewDB();
