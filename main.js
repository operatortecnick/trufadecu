const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.ico'), // We'll create this later
    title: 'TruFadeCU - Google Cloud Text-to-Speech'
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

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

// IPC handlers for file operations
ipcMain.handle('save-audio-file', async (event, audioBuffer, filename) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }
      ]
    });

    if (filePath) {
      fs.writeFileSync(filePath, audioBuffer);
      return { success: true, path: filePath };
    }
    
    return { success: false, error: 'No file path selected' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-credentials', async (event) => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (filePaths && filePaths.length > 0) {
      const credentialsPath = filePaths[0];
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      return { success: true, credentials, path: credentialsPath };
    }
    
    return { success: false, error: 'No file selected' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});