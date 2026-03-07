import type { UserBookmarkState, UserBookmark } from './types';
import type { UserBookmarkAction } from './actions';
import {
  ADD_BOOKMARK,
  REMOVE_BOOKMARK,
  UPDATE_BOOKMARK,
  LOAD_BOOKMARKS,
} from './actions';

export const initialState: UserBookmarkState = {
  bookmarksByDocument: {},
};

export function reducer(
  state: UserBookmarkState = initialState,
  action: UserBookmarkAction
): UserBookmarkState {
  switch (action.type) {
    case LOAD_BOOKMARKS: {
      const { documentId, bookmarks } = action.payload;
      return {
        ...state,
        bookmarksByDocument: {
          ...state.bookmarksByDocument,
          [documentId]: bookmarks,
        },
      };
    }
    case ADD_BOOKMARK: {
      const bm = action.payload;
      const existing = state.bookmarksByDocument[bm.documentId] ?? [];
      const updated = [...existing, bm].sort((a, b) => a.pageIndex - b.pageIndex);
      return {
        ...state,
        bookmarksByDocument: {
          ...state.bookmarksByDocument,
          [bm.documentId]: updated,
        },
      };
    }
    case REMOVE_BOOKMARK: {
      const { id } = action.payload;
      const updated: Record<string, UserBookmark[]> = {};
      for (const [docId, bms] of Object.entries(state.bookmarksByDocument)) {
        updated[docId] = bms.filter((b) => b.id !== id);
      }
      return { ...state, bookmarksByDocument: updated };
    }
    case UPDATE_BOOKMARK: {
      const { id, patch } = action.payload;
      const updated: Record<string, UserBookmark[]> = {};
      for (const [docId, bms] of Object.entries(state.bookmarksByDocument)) {
        updated[docId] = bms.map((b) =>
          b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b
        );
      }
      return { ...state, bookmarksByDocument: updated };
    }
    default:
      return state;
  }
}
