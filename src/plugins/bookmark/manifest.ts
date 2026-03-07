import type { PluginManifest } from '@embedpdf/core';
import type { UserBookmarkPluginConfig } from './types';

export const USER_BOOKMARK_PLUGIN_ID = 'user-bookmark' as const;

export const manifest: PluginManifest<UserBookmarkPluginConfig> = {
  id: USER_BOOKMARK_PLUGIN_ID,
  name: 'User Bookmark Plugin',
  version: '1.0.0',
  provides: [USER_BOOKMARK_PLUGIN_ID],
  requires: [],
  optional: [],
  defaultConfig: {},
};
