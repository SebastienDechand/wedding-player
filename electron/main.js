const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 320,
    height: 552,
    resizable: false,
    frame: false,
    backgroundColor: '#0a0808',
    icon: path.join(__dirname, '..', 'public', 'assets', 'tourne_disque.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const indexPath = path.join(
    __dirname, '..', 'dist', 'wedding-player', 'browser', 'index.html'
  );

  win.loadFile(indexPath)
    .catch(() => win.loadURL('http://localhost:4200'));

  win.once('ready-to-show', () => win.show());
}

ipcMain.on('win:minimize', () => win?.minimize());
ipcMain.on('win:close', () => win?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
