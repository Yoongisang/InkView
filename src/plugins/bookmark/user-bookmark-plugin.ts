import { BasePlugin, type PluginRegistry } from '@embedpdf/core';
import type {
  UserBookmarkPluginConfig,
  UserBookmarkCapability,
  UserBookmark,
  UserBookmarkState,
  AddBookmarkParams,
} from './types';
import type { UserBookmarkAction } from './actions';
import { ADD_BOOKMARK, REMOVE_BOOKMARK, UPDATE_BOOKMARK, LOAD_BOOKMARKS } from './actions';
import { db } from '../../store/db';

export class UserBookmarkPlugin extends BasePlugin<
  UserBookmarkPluginConfig,
  UserBookmarkCapability,
  UserBookmarkState,
  UserBookmarkAction
> {
  static readonly id = 'user-bookmark';

  constructor(id: string, registry: PluginRegistry) {
    super(id, registry);
  }

  async initialize(_config: UserBookmarkPluginConfig): Promise<void> {}

  protected buildCapability(): UserBookmarkCapability {
    return {
      addBookmark: (params) => this.addBookmark(params),
      removeBookmark: (id) => this.removeBookmark(id),
      updateBookmark: (id, patch) => this.updateBookmark(id, patch),
      getBookmarks: (documentId) => this.getBookmarks(documentId),
      exportBookmarks: (documentId) => this.exportBookmarks(documentId),
      importBookmarks: (documentId, json) => this.importBookmarks(documentId, json),
    };
  }

  protected onDocumentLoaded(documentId: string): void {
    db.userBookmarks
      .where('documentId')
      .equals(documentId)
      .toArray()
      .then((bookmarks) => {
        this.dispatch({
          type: LOAD_BOOKMARKS,
          payload: {
            documentId,
            bookmarks: bookmarks.sort((a, b) => a.pageIndex - b.pageIndex),
          },
        });
      })
      .catch((err) => this.logger.error('UserBookmarkPlugin', 'LoadError', String(err)));
  }

  private getBookmarks(documentId: string): UserBookmark[] {
    return this.state.bookmarksByDocument[documentId] ?? [];
  }

  private async addBookmark(params: AddBookmarkParams): Promise<UserBookmark> {
    const entry: UserBookmark = {
      id: crypto.randomUUID(),
      documentId: params.documentId,
      pageIndex: params.pageIndex,
      title: params.title,
      color: params.color ?? '#f59e0b',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.userBookmarks.add(entry);
    this.dispatch({ type: ADD_BOOKMARK, payload: entry });
    return entry;
  }

  private async removeBookmark(id: string): Promise<void> {
    await db.userBookmarks.delete(id);
    this.dispatch({ type: REMOVE_BOOKMARK, payload: { id } });
  }

  private async updateBookmark(
    id: string,
    patch: Partial<Pick<UserBookmark, 'title' | 'color'>>
  ): Promise<void> {
    await db.userBookmarks.update(id, { ...patch, updatedAt: Date.now() });
    this.dispatch({ type: UPDATE_BOOKMARK, payload: { id, patch } });
  }

  private exportBookmarks(documentId: string): string {
    return JSON.stringify(this.getBookmarks(documentId), null, 2);
  }

  private async importBookmarks(documentId: string, json: string): Promise<void> {
    const parsed: UserBookmark[] = JSON.parse(json);
    const normalized = parsed.map((b) => ({
      ...b,
      documentId,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    await db.userBookmarks.bulkAdd(normalized);
    const combined = [...this.getBookmarks(documentId), ...normalized].sort(
      (a, b) => a.pageIndex - b.pageIndex
    );
    this.dispatch({ type: LOAD_BOOKMARKS, payload: { documentId, bookmarks: combined } });
  }
}
