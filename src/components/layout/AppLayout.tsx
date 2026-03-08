import { useState, useCallback, useEffect, useRef } from 'react';
import { useRegistry, useCapability } from '@embedpdf/core/react';
import { useTranslation } from 'react-i18next';
import { Viewport } from '@embedpdf/plugin-viewport/react';
import { Scroller, useScroll } from '@embedpdf/plugin-scroll/react';
import { RenderLayer } from '@embedpdf/plugin-render/react';
import { TilingLayer } from '@embedpdf/plugin-tiling/react';
import type { PageLayout } from '@embedpdf/plugin-scroll';
import { GlobalPointerProvider, PagePointerProvider } from '@embedpdf/plugin-interaction-manager/react';
import { SelectionLayer } from '@embedpdf/plugin-selection/react';
import { useZoom } from '@embedpdf/plugin-zoom/react';
import { useSearch } from '@embedpdf/plugin-search/react';
import { SearchLayer } from '@embedpdf/plugin-search/react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { useOpenFile } from '../../hooks/useOpenFile';
import { useElectronFile } from '../../hooks/useElectronFile';
import { UserBookmarkPlugin } from '../../plugins/bookmark';
import { SplitDialog, usePdfBytes, useLastFile } from '../../plugins/split';
import { MergeDialog } from '../../plugins/merge';

export function AppLayout() {
  const { activeDocumentId } = useRegistry();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const { openFile, inputRef, handleFileChange } = useOpenFile();
  useElectronFile(); // Handle PDF files opened via OS file association (Electron only)
  const { pdfBytes, baseName } = usePdfBytes(activeDocumentId);
  const lastFile = useLastFile();

  const toggleSidebar = useCallback(() => setSidebarVisible((v) => !v), []);
  const toggleSearch = useCallback(() => setSearchVisible((v) => !v), []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); setSidebarVisible((v) => !v); }
      if (e.ctrlKey && e.key === 'o') { e.preventDefault(); openFile(); }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); if (activeDocumentId) setSearchVisible((v) => !v); }
      if (e.key === 'Escape') { setSearchVisible(false); }
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
          <PagePointerProvider
            documentId={activeDocumentId}
            pageIndex={page.pageIndex}
            style={{ position: 'absolute', inset: 0 }}
          >
            <SelectionLayer documentId={activeDocumentId} pageIndex={page.pageIndex} />
            <SearchLayer
              documentId={activeDocumentId}
              pageIndex={page.pageIndex}
              style={{ position: 'absolute', inset: 0 }}
            />
          </PagePointerProvider>
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

      {/* Search bar — shown when searchVisible && document open */}
      {searchVisible && activeDocumentId && (
        <SearchBar documentId={activeDocumentId} onClose={() => setSearchVisible(false)} />
      )}

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

/** Search bar — mounts/unmounts with search session lifecycle */
function SearchBar({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { state, provides: scope } = useSearch(documentId);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start search session on mount, stop on unmount
  useEffect(() => {
    scope?.startSearch();
    inputRef.current?.focus();
    return () => {
      scope?.stopSearch();
    };
  }, [scope]);

  const runSearch = useCallback(
    (val: string) => {
      if (!scope || !val.trim()) return;
      scope.searchAllPages(val).wait(() => {}, console.error);
    },
    [scope]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => runSearch(val), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.shiftKey ? scope?.previousResult() : scope?.nextResult();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const resultText = () => {
    if (!query.trim()) return '';
    if (state.loading) return '검색 중...';
    if (state.total === 0) return '결과 없음';
    return `${state.activeResultIndex + 1} / ${state.total}`;
  };

  return (
    <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-1.5">
      <input
        ref={inputRef}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t('toolbar.search') + '... (Enter: 다음, Shift+Enter: 이전)'}
        className="min-w-0 flex-1 rounded border border-border bg-surface-alt px-2 py-1 text-sm text-text outline-none focus:border-primary"
      />
      {query && (
        <span className="min-w-[80px] text-center text-xs text-text-muted">{resultText()}</span>
      )}
      <button
        className="rounded p-1 text-text-muted hover:bg-surface-alt disabled:opacity-40"
        onClick={() => scope?.previousResult()}
        disabled={!state.total}
        title="이전 결과 (Shift+Enter)"
      >
        <ChevronUp size={16} />
      </button>
      <button
        className="rounded p-1 text-text-muted hover:bg-surface-alt disabled:opacity-40"
        onClick={() => scope?.nextResult()}
        disabled={!state.total}
        title="다음 결과 (Enter)"
      >
        <ChevronDown size={16} />
      </button>
      <button
        className="rounded p-1 text-text-muted hover:bg-surface-alt"
        onClick={onClose}
        title="닫기 (Esc)"
      >
        <X size={16} />
      </button>
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
  const { provides: zoomCapability } = useZoom(documentId);
  const accDeltaRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTotalPagesChange(scrollState.totalPages);
  }, [scrollState.totalPages, onTotalPagesChange]);

  // Ctrl+wheel: smooth zoom via accumulated delta + debounce
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (!zoomCapability) return;

      // Accumulate delta (negative = zoom in, positive = zoom out)
      accDeltaRef.current += e.deltaY;

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const acc = accDeltaRef.current;
        accDeltaRef.current = 0;
        // deltaY: negative = scroll up = zoom in (positive delta)
        // Divide by 1000: 100px scroll ≈ 0.1 zoom step (same as one zoomIn/zoomOut)
        zoomCapability.requestZoomBy(-acc / 1000);
      }, 50);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [zoomCapability]);

  // Ctrl+D: add bookmark at current page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (!bookmarkCapability) return;
        // currentPage is 1-indexed (pageNumber); convert to 0-indexed pageIndex
        const pageIndex = scrollState.currentPage - 1;
        bookmarkCapability
          .addBookmark({ documentId, pageIndex, title: `페이지 ${scrollState.currentPage}` })
          .catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookmarkCapability, documentId, scrollState.currentPage]);

  return (
    <Viewport documentId={documentId} className="h-full w-full">
      <GlobalPointerProvider documentId={documentId} style={{ height: '100%' }}>
        <Scroller documentId={documentId} renderPage={renderPage} className="h-full w-full" />
      </GlobalPointerProvider>
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
