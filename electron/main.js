import { app, BrowserWindow, session, protocol, net } from 'electron';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Must be called before app.whenReady()
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true },
}]);

app.whenReady().then(() => {
  const isDev = !app.isPackaged;
  const DIST = path.join(process.resourcesPath, 'dist');

  // Inject COOP/COEP/CORP headers for SharedArrayBuffer (PDFium WASM)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['require-corp'],
        'Cross-Origin-Resource-Policy': ['cross-origin'],
      },
    });
  });

  // Register app:// protocol to serve dist files (production only)
  if (!isDev) {
    protocol.handle('app', async (request) => {
      const url = new URL(request.url);
      let pathname = url.pathname || '/index.html';
      if (pathname === '/') pathname = '/index.html';

      const filePath = path.join(DIST, pathname);
      try {
        const response = await net.fetch(pathToFileURL(filePath).href);
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        return new Response(response.body, { status: response.status, headers });
      } catch {
        // SPA fallback
        const fallback = await net.fetch(pathToFileURL(path.join(DIST, 'index.html')).href);
        const headers = new Headers(fallback.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        return new Response(fallback.body, { status: 200, headers });
      }
    });
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'InkView',
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadURL('app://localhost/index.html');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
