import { Analytics } from '@vercel/analytics/react';
import { ViewerProvider } from './viewer/ViewerProvider';
import { AppLayout } from './components/layout/AppLayout';

const isElectron = 'electronAPI' in window;

export default function App() {
  return (
    <ViewerProvider>
      <AppLayout />
      {!isElectron && <Analytics />}
    </ViewerProvider>
  );
}
