import { useState, useCallback } from 'react';
import { useRegistry } from '@embedpdf/core/react';
import { useTranslation } from 'react-i18next';
import { Viewport } from '@embedpdf/plugin-viewport/react';
import { Scroller } from '@embedpdf/plugin-scroll/react';
import { RenderLayer } from '@embedpdf/plugin-render/react';
import { TilingLayer } from '@embedpdf/plugin-tiling/react';
import type { PageLayout } from '@embedpdf/plugin-scroll';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';

export function AppLayout() {
  const { activeDocumentId } = useRegistry();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [, setSearchVisible] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((v) => !v);
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchVisible((v) => !v);
  }, []);

  const renderPage = useCallback(
    (page: PageLayout) => {
      if (!activeDocumentId) return null;
      return (
        <div
          key={page.pageIndex}
          style={{
            position: 'absolute',
            left: page.x,
            top: page.y,
            width: page.rotatedWidth,
            height: page.rotatedHeight,
          }}
        >
          <TilingLayer
            documentId={activeDocumentId}
            pageIndex={page.pageIndex}
          />
          <RenderLayer
            documentId={activeDocumentId}
            pageIndex={page.pageIndex}
            style={{ position: 'absolute', inset: 0 }}
          />
        </div>
      );
    },
    [activeDocumentId]
  );

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        onToggleSearch={toggleSearch}
        onToggleSidebar={toggleSidebar}
        onOpenSplit={() => {}}
        onOpenMerge={() => {}}
        onAddBookmark={() => {}}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar visible={sidebarVisible} />

        <div className="flex-1 bg-neutral-200">
          {activeDocumentId ? (
            <Viewport
              documentId={activeDocumentId}
              className="h-full w-full"
            >
              <Scroller
                documentId={activeDocumentId}
                renderPage={renderPage}
                className="h-full w-full"
              />
            </Viewport>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-text-muted">{t('sidebar.noDocument')}</p>
        <p className="mt-2 text-sm text-text-muted">
          Ctrl+O {t('toolbar.open')}
        </p>
      </div>
    </div>
  );
}
