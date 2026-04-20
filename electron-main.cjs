/**
 * 半人马 Trade — Electron Main Process
 *
 * 职责：
 *  1. 启动内置 Express+SQLite 后端 (port 3456)
 *  2. 创建 BrowserWindow 加载前端
 *  3. Dev 模式 → http://localhost:5173  |  Prod → dist/index.html
 */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;

const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

// ---------------------------------------------------------------------------
// 1. Start local Express server
// ---------------------------------------------------------------------------
function startServer() {
  const serverPath = isDev
    ? path.join(__dirname, 'server', 'index.cjs')
    : path.join(process.resourcesPath, 'server', 'index.cjs');

  console.log('[Electron] Starting backend:', serverPath);

  serverProcess = fork(serverPath, [], {
    env: { ...process.env, PORT: '3456', NODE_ENV: isDev ? 'development' : 'production' },
    stdio: 'pipe',
  });

  serverProcess.stdout?.on('data', (d) => console.log('[Server]', d.toString().trim()));
  serverProcess.stderr?.on('data', (d) => console.error('[Server]', d.toString().trim()));
  serverProcess.on('exit', (code) => console.log('[Server] exited with code', code));

  return new Promise((resolve) => {
    // Give server 2s to initialize DB + start listening
    setTimeout(resolve, 2000);
  });
}

// ---------------------------------------------------------------------------
// 2. Create main window
// ---------------------------------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: '半人马 Trade',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#faf9f5',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // Show when ready to avoid flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// 3. App lifecycle
// ---------------------------------------------------------------------------
app.on('ready', async () => {
  await startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    console.log('[Electron] Stopping backend server...');
    serverProcess.kill();
    serverProcess = null;
  }
});
