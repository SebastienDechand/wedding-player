const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('playerBridge', {
  minimize: () => ipcRenderer.send('win:minimize'),
  close:    () => ipcRenderer.send('win:close'),
});
