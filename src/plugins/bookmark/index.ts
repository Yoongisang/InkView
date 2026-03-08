import type { PluginPackage } from '@embedpdf/core';
import { UserBookmarkPlugin } from './user-bookmark-plugin';
import { manifest } from './manifest';
import { reducer, initialState } from './reducer';
import type { UserBookmarkPluginConfig, UserBookmarkState } from './types';
import type { UserBookmarkAction } from './actions';

export const UserBookmarkPluginPackage: PluginPackage<
  UserBookmarkPlugin,
  UserBookmarkPluginConfig,
  UserBookmarkState,
  UserBookmarkAction
> = {
  manifest,
  create(registry) {
    return new UserBookmarkPlugin(manifest.id, registry);
  },
  reducer: reducer as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  initialState,
};

export * from './types';
export * from './actions';
export * from './manifest';
export { UserBookmarkPlugin } from './user-bookmark-plugin';
export { useUserBookmarks } from './useUserBookmarks';
export { BookmarkPanel } from './BookmarkPanel';
