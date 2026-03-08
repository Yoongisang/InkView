import { useState, useCallback, useEffect } from 'react';
import { useRegistry } from '@embedpdf/core/react';
import { useTranslation } from 'react-i18next';
import { Viewport } from '@embedpdf/plugin-viewport/react';
import { Scroller, useScroll } from '@embedpdf/plugin-scroll/react';
import { RenderLayer } from '@embedpdf/plugin-render/react';
import { TilingLayer } from '@embedpdf/plugin-tiling/react';
import type { PageLayout } from '@embedpdf/plugin-scroll';
import { useCapability } from '@embedpdf/core/react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { useOpenFile } from '../../hooks/useOpenFile';
import { UserBookmarkPlugin } from '../../plugins/bookmark';
import { SplitDialog, usePdfBytes, useLastFile } from '../../plugins/split';
import { MergeDialog } from '../../plugins/merge';

export function AppLayout() {
  const { activeDocumentId } = useRegistry();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [, setSearchVisible] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const { openFile, inputRef, handleFileChange } = useOpenFile();
  const { pdfBytes, baseName } = usePdfBytes(activeDocumentId);
  const lastFile = useLastFile();

  const toggleSidebar = useCallback(() => setSidebarVisible((v) => !v), []);
  const toggleSearch = useCallback(() => setSearchVisible((v) => !v), []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); setSidebarVisible((v) => !v); }
      if (e.ctrlKey && e.key === 'o') { e.preventDefault(); openFile(); }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') { e.preventDefault(); if (activeDocumentId) setSplitOpen(true); }
      if (e.ctrlKey && e.shiftKey && e.key === 'M') { e.preventDefault(); setMergeOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openFile, activeDocumentId]);

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
          <TilingLayer documentId={activeDocumentId} pageIndex={page.pageIndex} />
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
      {/* Hidden file input for hash-based file opener */}
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

      <Toolbar
        onToggleSearch={toggleSearch}
        onToggleSidebar={toggleSidebar}
        onOpenSplit={() => setSplitOpen(true)}
        onOpenMerge={() => setMergeOpen(true)}
        onOpenFile={openFile}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar visible={sidebarVisible} />
        <div className="flex-1 bg-neutral-200">
          {activeDocumentId ? (
            <ViewerWithShortcuts
              documentId={activeDocumentId}
              renderPage={renderPage}
              onTotalPagesChange={setTotalPages}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <StatusBar />

      {/* Dialogs */}
      <SplitDialog
        open={splitOpen}
        onClose={() => setSplitOpen(false)}
        pdfBytes={pdfBytes}
        baseName={baseName}
        totalPages={totalPages}
      />
      <MergeDialog
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        initialFile={lastFile}
      />
    </div>
  );
}

/** Read total pages from scroll state — wrapped in a child component to avoid hook-order issues */
function ViewerWithShortcuts({
  documentId,
  renderPage,
  onTotalPagesChange,
}: {
  documentId: string;
  renderPage: (page: PageLayout) => React.ReactNode;
  onTotalPagesChange: (n: number) => void;
}) {
  const { provides: bookmarkCapability } = useCapability<UserBookmarkPlugin>(UserBookmarkPlugin.id);
  const { state: scrollState } = useScroll(documentId);

  useEffect(() => {
    onTotalPagesChange(scrollState.totalPages);
  }, [scrollState.totalPages, onTotalPagesChange]);

  // Ctrl+D: add bookmark at current page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (!bookmarkCapability) return;
        const pageIndex = scrollState.currentPage;
        bookmarkCapability
          .addBookmark({ documentId, pageIndex, title: `페이지 ${pageIndex + 1}` })
          .catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookmarkCapability, documentId, scrollState.currentPage]);

  return (
    <Viewport documentId={documentId} className="h-full w-full">
      <Scroller documentId={documentId} renderPage={renderPage} className="h-full w-full" />
    </Viewport>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-text-muted">{t('sidebar.noDocument')}</p>
        <p className="mt-2 text-sm text-text-muted">Ctrl+O {t('toolbar.open')}</p>
      </div>
    </div>
  );
}
