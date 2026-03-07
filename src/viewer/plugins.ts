import type { PluginBatchRegistrations } from '@embedpdf/core/react';

import { ViewportPluginPackage } from '@embedpdf/plugin-viewport';
import { ScrollPluginPackage } from '@embedpdf/plugin-scroll';
import { RenderPluginPackage } from '@embedpdf/plugin-render';
import { TilingPluginPackage } from '@embedpdf/plugin-tiling';
import { ZoomPluginPackage } from '@embedpdf/plugin-zoom';
import { SearchPluginPackage } from '@embedpdf/plugin-search';
import { PanPluginPackage } from '@embedpdf/plugin-pan';
import { RotatePluginPackage } from '@embedpdf/plugin-rotate';
import { SpreadPluginPackage } from '@embedpdf/plugin-spread';
import { FullscreenPluginPackage } from '@embedpdf/plugin-fullscreen';
import { ExportPluginPackage } from '@embedpdf/plugin-export';
import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail';
import { SelectionPluginPackage } from '@embedpdf/plugin-selection';
import { AnnotationPluginPackage } from '@embedpdf/plugin-annotation';
import { CommandsPluginPackage } from '@embedpdf/plugin-commands';
import { InteractionManagerPluginPackage } from '@embedpdf/plugin-interaction-manager';
import { DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager';
import { CapturePluginPackage } from '@embedpdf/plugin-capture';
import { BookmarkPluginPackage } from '@embedpdf/plugin-bookmark';
import { UIPluginPackage } from '@embedpdf/plugin-ui';
import { ViewManagerPluginPackage } from '@embedpdf/plugin-view-manager';

export const plugins: PluginBatchRegistrations = [
  { package: ViewportPluginPackage },
  { package: InteractionManagerPluginPackage },
  { package: ScrollPluginPackage },
  { package: RenderPluginPackage },
  { package: TilingPluginPackage },
  { package: ZoomPluginPackage, config: { defaultZoomLevel: 'fit-width' } },
  { package: PanPluginPackage },
  { package: RotatePluginPackage },
  { package: SpreadPluginPackage },
  { package: SearchPluginPackage },
  { package: FullscreenPluginPackage },
  { package: ExportPluginPackage },
  { package: ThumbnailPluginPackage },
  { package: SelectionPluginPackage },
  { package: AnnotationPluginPackage },
  { package: CommandsPluginPackage },
  { package: DocumentManagerPluginPackage },
  { package: CapturePluginPackage },
  { package: BookmarkPluginPackage },
  { package: UIPluginPackage },
  { package: ViewManagerPluginPackage },
];
