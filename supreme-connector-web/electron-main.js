const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "Supreme Connector Admin",
    webPreferences: {
      preload: path.join(__dirname, "electron-preload.js"),
      // CRITICAL: Disables CORS and Mixed Content blocks, allowing Next.js 
      // to make HTTP local network requests directly to Tally Prime on localhost:9000
      webSecurity: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load local Next.js development server
  const startUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
  win.loadURL(startUrl);

  // Remove menu bar for clean premium app appearance
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
