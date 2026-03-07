import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistry } from '@embedpdf/core/react';
import { Image, Bookmark, List } from 'lucide-react';

type SidebarTab = 'thumbnails' | 'bookmarks' | 'outline';

interface SidebarProps {
  visible: boolean;
}

export function Sidebar({ visible }: SidebarProps) {
  const { t } = useTranslation();
  const { activeDocumentId } = useRegistry();
  const [activeTab, setActiveTab] = useState<SidebarTab>('thumbnails');

  if (!visible) return null;

  return (
    <div className="flex h-full w-64 flex-shrink-0 border-r border-border bg-sidebar-bg">
      {/* Tab buttons */}
      <div className="flex w-10 flex-col items-center gap-1 border-r border-border bg-surface py-2">
        <SidebarTabButton
          icon={<Image size={16} />}
          label={t('sidebar.thumbnails')}
          active={activeTab === 'thumbnails'}
          onClick={() => setActiveTab('thumbnails')}
        />
        <SidebarTabButton
          icon={<Bookmark size={16} />}
          label={t('sidebar.bookmarks')}
          active={activeTab === 'bookmarks'}
          onClick={() => setActiveTab('bookmarks')}
        />
        <SidebarTabButton
          icon={<List size={16} />}
          label={t('sidebar.outline')}
          active={activeTab === 'outline'}
          onClick={() => setActiveTab('outline')}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-2">
        {!activeDocumentId ? (
          <p className="py-8 text-center text-sm text-text-muted">
            {t('sidebar.noDocument')}
          </p>
        ) : (
          <>
            {activeTab === 'thumbnails' && <ThumbnailsPanel />}
            {activeTab === 'bookmarks' && <BookmarksPanel />}
            {activeTab === 'outline' && <OutlinePanel />}
          </>
        )}
      </div>
    </div>
  );
}

function SidebarTabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center justify-center rounded p-1.5 transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'text-text-muted hover:bg-surface-alt'
      }`}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function ThumbnailsPanel() {
  return (
    <div className="text-sm text-text-muted">
      {/* Phase 1: 기본 플레이스홀더, 추후 @embedpdf/plugin-thumbnail 연동 */}
      <p className="py-4 text-center">썸네일 영역</p>
    </div>
  );
}

function BookmarksPanel() {
  const { t } = useTranslation();
  return (
    <div className="text-sm text-text-muted">
      {/* Phase 2에서 커스텀 BookmarkPanel로 교체 */}
      <p className="py-4 text-center">{t('bookmark.empty')}</p>
    </div>
  );
}

function OutlinePanel() {
  return (
    <div className="text-sm text-text-muted">
      {/* Phase 2에서 PDF 아웃라인 연동 */}
      <p className="py-4 text-center">목차 영역</p>
    </div>
  );
}
