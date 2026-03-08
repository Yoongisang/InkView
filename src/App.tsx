import { Analytics } from '@vercel/analytics/react';
import { ViewerProvider } from './viewer/ViewerProvider';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <ViewerProvider>
      <AppLayout />
      <Analytics />
    </ViewerProvider>
  );
}
