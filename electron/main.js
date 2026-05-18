const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const indexPath = path.join(
    __dirname,
    "..",
    "dist",
    "wedding-player",
    "index.html",
  );
  win.loadFile(indexPath).catch(() => {
    // fallback to dev server
    win.loadURL("http://localhost:4200");
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
