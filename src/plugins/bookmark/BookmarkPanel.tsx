import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistry } from '@embedpdf/core/react';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { useBookmarkCapability } from '@embedpdf/plugin-bookmark/react';
import { Bookmark, Trash2, Edit2, Download, Upload, Plus } from 'lucide-react';
import { useUserBookmarks } from './useUserBookmarks';
import type { UserBookmark } from '../../store/db';

const COLORS = [
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function BookmarkPanel() {
  const { t } = useTranslation();
  const { activeDocumentId } = useRegistry();
  const [tab, setTab] = useState<'user' | 'outline'>('user');

  return (
    <div className="flex flex-col gap-2">
      {/* Sub-tabs */}
      <div className="flex gap-1">
        <button
          className={`flex-1 rounded py-1 text-xs ${
            tab === 'user'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:bg-surface-alt'
          }`}
          onClick={() => setTab('user')}
        >
          {t('bookmark.userBookmarks')}
        </button>
        <button
          className={`flex-1 rounded py-1 text-xs ${
            tab === 'outline'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:bg-surface-alt'
          }`}
          onClick={() => setTab('outline')}
        >
          {t('bookmark.pdfOutline')}
        </button>
      </div>

      {tab === 'user' ? (
        <UserBookmarkList documentId={activeDocumentId} />
      ) : (
        <PdfOutlineList documentId={activeDocumentId} />
      )}
    </div>
  );
}

function UserBookmarkList({ documentId }: { documentId: string | null }) {
  const { t } = useTranslation();
  const scrollState = documentId ? useScroll(documentId) : null;
  const { bookmarks, addBookmark, removeBookmark, updateBookmark, exportBookmarks, importBookmarks } =
    useUserBookmarks(documentId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const currentPage = scrollState?.state.currentPage ?? 0;

  const handleAdd = async () => {
    if (!documentId) return;
    const pageNum = currentPage + 1;
    await addBookmark(currentPage, `${t('statusbar.page')} ${pageNum}`);
  };

  const handleEdit = (bm: UserBookmark) => {
    setEditingId(bm.id);
    setEditTitle(bm.title);
  };

  const handleEditSave = async (id: string) => {
    await updateBookmark(id, { title: editTitle });
    setEditingId(null);
  };

  const handleExport = () => {
    const json = exportBookmarks();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      importBookmarks(json).catch(console.error);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Toolbar */}
      <div className="flex items-center gap-1">
        <button
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-primary hover:bg-surface-alt disabled:opacity-40"
          onClick={handleAdd}
          disabled={!documentId}
          title={t('bookmark.add')}
        >
          <Plus size={12} />
          {t('bookmark.add')}
        </button>
        <div className="flex-1" />
        <button
          className="rounded p-1 text-text-muted hover:bg-surface-alt disabled:opacity-40"
          onClick={handleExport}
          disabled={!documentId || bookmarks.length === 0}
          title={t('bookmark.export')}
        >
          <Download size={14} />
        </button>
        <button
          className="rounded p-1 text-text-muted hover:bg-surface-alt disabled:opacity-40"
          onClick={() => importInputRef.current?.click()}
          disabled={!documentId}
          title={t('bookmark.import')}
        >
          <Upload size={14} />
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      {/* Bookmark list */}
      {bookmarks.length === 0 ? (
        <p className="py-4 text-center text-xs text-text-muted">{t('bookmark.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {bookmarks.map((bm) => (
            <li
              key={bm.id}
              className="group flex items-center gap-1 rounded px-1 py-1 hover:bg-surface-alt"
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: bm.color }}
              />
              {editingId === bm.id ? (
                <input
                  className="min-w-0 flex-1 rounded border border-border bg-surface px-1 text-xs text-text focus:outline-none"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleEditSave(bm.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(bm.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-xs text-text">
                  {bm.title}
                  <span className="ml-1 text-text-muted">p.{bm.pageIndex + 1}</span>
                </span>
              )}
              {/* Color dots */}
              <div className="hidden gap-0.5 group-hover:flex">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    className="h-2.5 w-2.5 rounded-full border border-border/50"
                    style={{ backgroundColor: c }}
                    onClick={() => updateBookmark(bm.id, { color: c })}
                    title={c}
                  />
                ))}
              </div>
              <button
                className="hidden rounded p-0.5 text-text-muted hover:text-text group-hover:block"
                onClick={() => handleEdit(bm)}
                title={t('bookmark.edit')}
              >
                <Edit2 size={12} />
              </button>
              <button
                className="hidden rounded p-0.5 text-text-muted hover:text-red-500 group-hover:block"
                onClick={() => removeBookmark(bm.id)}
                title={t('bookmark.delete')}
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PdfOutlineList({ documentId }: { documentId: string | null }) {
  const { t } = useTranslation();
  const { provides: bookmarkCapability } = useBookmarkCapability();
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load PDF outline when document is ready
  useEffect(() => {
    if (!documentId || !bookmarkCapability) return;
    const scope = bookmarkCapability.forDocument(documentId);
    scope
      .getBookmarks()
      .toPromise()
      .then(({ bookmarks }) => {
        setOutlineItems(flattenOutline(bookmarks as any[], 0)); // eslint-disable-line @typescript-eslint/no-explicit-any
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [documentId, bookmarkCapability]);

  if (!documentId) {
    return <p className="py-4 text-center text-xs text-text-muted">{t('sidebar.noDocument')}</p>;
  }

  if (!loaded) {
    return <p className="py-4 text-center text-xs text-text-muted">{t('app.loading')}</p>;
  }

  if (outlineItems.length === 0) {
    return <p className="py-4 text-center text-xs text-text-muted">{t('bookmark.empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {outlineItems.map((item, i) => (
        <li
          key={i}
          className="flex items-center gap-1 rounded px-1 py-1 hover:bg-surface-alt"
          style={{ paddingLeft: `${item.depth * 12 + 4}px` }}
        >
          <Bookmark size={12} className="flex-shrink-0 text-text-muted" />
          <span className="min-w-0 flex-1 truncate text-xs text-text">{item.title}</span>
        </li>
      ))}
    </ul>
  );
}

interface OutlineItem {
  title: string;
  depth: number;
}

function flattenOutline(items: any[], depth: number): OutlineItem[] {
  const result: OutlineItem[] = [];
  for (const item of items) {
    result.push({ title: item.title ?? '', depth });
    if (item.children?.length) {
      result.push(...flattenOutline(item.children, depth + 1));
    }
  }
  return result;
}
