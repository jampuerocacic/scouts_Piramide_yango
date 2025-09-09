const { app, BrowserWindow, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

   // Configurar logging antes de usar autoUpdater
  autoUpdater.logger = require("electron-log");
  autoUpdater.logger.transports.file.level = "info";

   // Buscar actualizaciones
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-downloaded", (info) => {
    dialog.showMessageBox(win, {
      type: "info",
      title: "Actualización lista",
      message: `Se ha descargado la versión ${info.version}. La app se reiniciará para aplicar la actualización.`,
      buttons: ["Reiniciar ahora", "Después"],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on("checking-for-update", () => console.log("Buscando actualizaciones..."));
  autoUpdater.on("update-available", (info) => console.log("Actualización disponible:", info.version));
  autoUpdater.on("update-not-available", () => console.log("No hay actualizaciones disponibles"));
  autoUpdater.on("error", (err) => console.error("Error al buscar actualización:", err));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
