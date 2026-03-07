import type { UserBookmark } from './types';

export const ADD_BOOKMARK = 'user-bookmark/ADD' as const;
export const REMOVE_BOOKMARK = 'user-bookmark/REMOVE' as const;
export const UPDATE_BOOKMARK = 'user-bookmark/UPDATE' as const;
export const LOAD_BOOKMARKS = 'user-bookmark/LOAD' as const;

export interface AddBookmarkAction {
  type: typeof ADD_BOOKMARK;
  payload: UserBookmark;
}

export interface RemoveBookmarkAction {
  type: typeof REMOVE_BOOKMARK;
  payload: { id: string };
}

export interface UpdateBookmarkAction {
  type: typeof UPDATE_BOOKMARK;
  payload: { id: string; patch: Partial<UserBookmark> };
}

export interface LoadBookmarksAction {
  type: typeof LOAD_BOOKMARKS;
  payload: { documentId: string; bookmarks: UserBookmark[] };
}

export type UserBookmarkAction =
  | AddBookmarkAction
  | RemoveBookmarkAction
  | UpdateBookmarkAction
  | LoadBookmarksAction;
