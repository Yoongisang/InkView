import { useTranslation } from 'react-i18next';
import { useDocumentManagerCapability } from '@embedpdf/plugin-document-manager/react';
import { useZoomCapability } from '@embedpdf/plugin-zoom/react';
import { useRegistry } from '@embedpdf/core/react';
import { useScrollCapability } from '@embedpdf/plugin-scroll/react';
import { useRotateCapability } from '@embedpdf/plugin-rotate/react';
import { useFullscreenCapability } from '@embedpdf/plugin-fullscreen/react';
import {
  FolderOpen,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize,
  Search,
  Scissors,
  Merge,
  Bookmark,
} from 'lucide-react';

interface ToolbarProps {
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
  onOpenSplit: () => void;
  onOpenMerge: () => void;
  onAddBookmark: () => void;
}

export function Toolbar({
  onToggleSearch,
  onToggleSidebar,
  onOpenSplit,
  onOpenMerge,
  onAddBookmark,
}: ToolbarProps) {
  const { t } = useTranslation();
  const { activeDocumentId } = useRegistry();
  const { provides: docManager } = useDocumentManagerCapability();
  const { provides: zoom } = useZoomCapability();
  const { provides: scroll } = useScrollCapability();
  const { provides: rotate } = useRotateCapability();
  const { provides: fullscreen } = useFullscreenCapability();

  const hasDoc = !!activeDocumentId;

  return (
    <div className="flex h-12 items-center gap-1 border-b border-border bg-toolbar-bg px-3">
      {/* File */}
      <ToolbarButton
        icon={<FolderOpen size={18} />}
        label={t('toolbar.open')}
        onClick={() => docManager?.openFileDialog()}
      />

      <ToolbarDivider />

      {/* Navigation */}
      <ToolbarButton
        icon={<ChevronLeft size={18} />}
        label={t('toolbar.prevPage')}
        onClick={() => scroll?.scrollToPreviousPage()}
        disabled={!hasDoc}
      />
      <ToolbarButton
        icon={<ChevronRight size={18} />}
        label={t('toolbar.nextPage')}
        onClick={() => scroll?.scrollToNextPage()}
        disabled={!hasDoc}
      />

      <ToolbarDivider />

      {/* Zoom */}
      <ToolbarButton
        icon={<ZoomOut size={18} />}
        label={t('toolbar.zoomOut')}
        onClick={() => zoom?.zoomOut()}
        disabled={!hasDoc}
      />
      <ToolbarButton
        icon={<ZoomIn size={18} />}
        label={t('toolbar.zoomIn')}
        onClick={() => zoom?.zoomIn()}
        disabled={!hasDoc}
      />

      <ToolbarDivider />

      {/* View */}
      <ToolbarButton
        icon={<RotateCw size={18} />}
        label={t('toolbar.rotate')}
        onClick={() => rotate?.rotateForward()}
        disabled={!hasDoc}
      />
      <ToolbarButton
        icon={<Maximize size={18} />}
        label={t('toolbar.fullscreen')}
        onClick={() => fullscreen?.toggleFullscreen()}
      />

      <ToolbarDivider />

      {/* Search */}
      <ToolbarButton
        icon={<Search size={18} />}
        label={t('toolbar.search')}
        onClick={onToggleSearch}
        disabled={!hasDoc}
      />

      {/* Bookmark */}
      <ToolbarButton
        icon={<Bookmark size={18} />}
        label={t('toolbar.bookmark')}
        onClick={onAddBookmark}
        disabled={!hasDoc}
      />

      <div className="flex-1" />

      {/* Tools */}
      <ToolbarButton
        icon={<Scissors size={18} />}
        label={t('toolbar.split')}
        onClick={onOpenSplit}
        disabled={!hasDoc}
      />
      <ToolbarButton
        icon={<Merge size={18} />}
        label={t('toolbar.merge')}
        onClick={onOpenMerge}
      />

      {/* Sidebar toggle */}
      <ToolbarDivider />
      <button
        className="rounded px-2 py-1 text-xs text-text-muted hover:bg-surface-alt"
        onClick={onToggleSidebar}
      >
        {t('sidebar.thumbnails')}
      </button>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="flex items-center justify-center rounded p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}
