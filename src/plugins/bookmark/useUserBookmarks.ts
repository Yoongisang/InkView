import { useState, useEffect, useCallback } from 'react';
import { useCapability } from '@embedpdf/core/react';
import { liveQuery } from 'dexie';
import { UserBookmarkPlugin } from './user-bookmark-plugin';
import { db, type UserBookmark } from '../../store/db';

export function useUserBookmarks(documentId: string | null) {
  const { provides: capability } = useCapability<UserBookmarkPlugin>(
    UserBookmarkPlugin.id
  );
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);

  useEffect(() => {
    if (!documentId) return;
    const subscription = liveQuery(() =>
      db.userBookmarks.where('documentId').equals(documentId).sortBy('pageIndex')
    ).subscribe({
      next: (bms) => setBookmarks(bms),
      error: (err) => console.error('liveQuery error', err),
    });
    return () => subscription.unsubscribe();
  }, [documentId]);

  const addBookmark = useCallback(
    async (pageIndex: number, title: string, color?: string) => {
      if (!capability || !documentId) return;
      await capability.addBookmark({ documentId, pageIndex, title, color });
    },
    [capability, documentId]
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      if (!capability) return;
      await capability.removeBookmark(id);
    },
    [capability]
  );

  const updateBookmark = useCallback(
    async (id: string, patch: Partial<Pick<UserBookmark, 'title' | 'color'>>) => {
      if (!capability) return;
      await capability.updateBookmark(id, patch);
    },
    [capability]
  );

  const exportBookmarks = useCallback(() => {
    if (!capability || !documentId) return '';
    return capability.exportBookmarks(documentId);
  }, [capability, documentId]);

  const importBookmarks = useCallback(
    async (json: string) => {
      if (!capability || !documentId) return;
      await capability.importBookmarks(documentId, json);
    },
    [capability, documentId]
  );

  return {
    bookmarks: documentId ? bookmarks : [],
    addBookmark,
    removeBookmark,
    updateBookmark,
    exportBookmarks,
    importBookmarks,
  };
}
