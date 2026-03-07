import type { BasePluginConfig } from '@embedpdf/core';

export interface UserBookmark {
  id: string;
  documentId: string;
  pageIndex: number;
  title: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserBookmarkState {
  bookmarksByDocument: Record<string, UserBookmark[]>;
}

export interface UserBookmarkPluginConfig extends BasePluginConfig {}

export interface AddBookmarkParams {
  documentId: string;
  pageIndex: number;
  title: string;
  color?: string;
}

export interface UserBookmarkCapability {
  addBookmark(params: AddBookmarkParams): Promise<UserBookmark>;
  removeBookmark(id: string): Promise<void>;
  updateBookmark(
    id: string,
    patch: Partial<Pick<UserBookmark, 'title' | 'color'>>
  ): Promise<void>;
  getBookmarks(documentId: string): UserBookmark[];
  exportBookmarks(documentId: string): string;
  importBookmarks(documentId: string, json: string): Promise<void>;
}
