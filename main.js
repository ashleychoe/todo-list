try {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`),
    awaitWriteFinish: true
  });
} catch (_) {
  console.log('Electron-reload not active');
}


const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 582,
    height: 690,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('close-window', () => {
    win.close();
  });

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
