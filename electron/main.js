import { app, BrowserWindow, session, protocol, net, ipcMain } from 'electron';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Must be called before app.whenReady()
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true },
}]);

/**
 * Find a PDF file path from process.argv.
 * In packaged mode: argv = [executablePath, pdfPath?]
 * In dev mode:      argv = [electronPath, '.', ...flags, pdfPath?]
 */
function getPdfPathFromArgv() {
  return process.argv
    .slice(1) // skip the executable itself
    .find(arg => !arg.startsWith('-') && arg.toLowerCase().endsWith('.pdf')) ?? null;
}

/** Send the file at filePath to the renderer window via IPC. */
async function sendFileToRenderer(win, filePath) {
  try {
    const nodeBuffer = await readFile(filePath);
    // Copy to a clean ArrayBuffer (avoid Node Buffer pooling issues)
    const arrayBuffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength
    );
    win.webContents.send('open-file', {
      buffer: arrayBuffer,
      name: path.basename(filePath),
    });
  } catch (err) {
    console.error('[InkView] Failed to read PDF:', filePath, err);
  }
}

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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadURL('app://localhost/index.html');
  }

  // After renderer is ready, send the PDF file (if launched with one)
  const pdfPath = getPdfPathFromArgv();
  if (pdfPath) {
    win.webContents.once('did-finish-load', () => {
      // Small delay to let the React app initialize plugins
      setTimeout(() => sendFileToRenderer(win, pdfPath), 500);
    });
  }

  // macOS: handle files opened via Finder while app is already running
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    if (filePath.toLowerCase().endsWith('.pdf')) {
      sendFileToRenderer(win, filePath);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
