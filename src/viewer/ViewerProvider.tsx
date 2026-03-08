import { useState, useCallback, type ReactNode } from 'react';
import { EmbedPDF, type PluginBatchRegistrations } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import type { PluginRegistry } from '@embedpdf/core';
import { useTranslation } from 'react-i18next';
import { plugins } from './plugins';

interface ViewerProviderProps {
  children: ReactNode;
}

export function ViewerProvider({ children }: ViewerProviderProps) {
  const { t } = useTranslation();
  const { engine, isLoading, error } = usePdfiumEngine({
    wasmUrl: '/pdfium/pdfium.wasm',
    // worker mode requires SharedArrayBuffer (COOP/COEP headers).
    // Fall back to main-thread mode when crossOriginIsolated is not set.
    worker: !!window.crossOriginIsolated,
  });
  const [, setRegistry] = useState<PluginRegistry | null>(null);

  const handleInitialized = useCallback(async (registry: PluginRegistry) => {
    setRegistry(registry);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-alt">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-text-muted">{t('app.loadingEngine')}</p>
        </div>
      </div>
    );
  }

  if (error || !engine) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-alt">
        <p className="text-red-500">{t('app.error')}: {error?.message}</p>
      </div>
    );
  }

  return (
    <EmbedPDF
      engine={engine}
      plugins={plugins as unknown as PluginBatchRegistrations}
      onInitialized={handleInitialized}
    >
      {children}
    </EmbedPDF>
  );
}
