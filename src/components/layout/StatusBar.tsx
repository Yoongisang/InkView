import { useTranslation } from 'react-i18next';
import { useRegistry } from '@embedpdf/core/react';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { useZoom } from '@embedpdf/plugin-zoom/react';

export function StatusBar() {
  const { t } = useTranslation();
  const { activeDocumentId, activeDocument } = useRegistry();

  if (!activeDocumentId) {
    return (
      <div className="flex h-7 items-center border-t border-border bg-statusbar-bg px-3">
        <span className="text-xs text-text-muted">InkView</span>
      </div>
    );
  }

  return (
    <div className="flex h-7 items-center border-t border-border bg-statusbar-bg px-3">
      <StatusBarContent documentId={activeDocumentId} />
      <div className="flex-1" />
      {activeDocument?.name && (
        <span className="text-xs text-text-muted">{activeDocument.name}</span>
      )}
    </div>
  );
}

function StatusBarContent({ documentId }: { documentId: string }) {
  const { t } = useTranslation();
  const { state: scrollState } = useScroll(documentId);
  const { state: zoomState } = useZoom(documentId);

  const zoomPercent = zoomState?.currentZoomLevel
    ? Math.round(
        (typeof zoomState.currentZoomLevel === 'number'
          ? zoomState.currentZoomLevel
          : 1) * 100
      )
    : 100;

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-text-muted">
        {t('statusbar.page')} {scrollState.currentPage + 1} {t('statusbar.of')}{' '}
        {scrollState.totalPages}
      </span>
      <span className="text-xs text-text-muted">
        {t('statusbar.zoom')}: {zoomPercent}%
      </span>
    </div>
  );
}
