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

  console.log("🟢 Creando ventana principal...");
  win.loadFile("index.html");

  // Configurar logging de electron-log
  autoUpdater.logger = require("electron-log");
  autoUpdater.logger.transports.file.level = "info";
  console.log("📝 Logger configurado. Revisando actualizaciones...");

  // Forzar logs de electron-log en consola también
  autoUpdater.logger.info("Iniciando verificación de updates...");

  // Lanzar chequeo de updates
  autoUpdater.checkForUpdatesAndNotify();

  // Eventos de autoUpdater
  autoUpdater.on("checking-for-update", () => {
    console.log("🔄 Buscando actualizaciones en GitHub...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log(`✅ Actualización encontrada: versión ${info.version}`);
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("ℹ️ No hay actualizaciones disponibles. Info:", info);
  });

  autoUpdater.on("error", (err) => {
    console.error("❌ Error al buscar actualización:", err);
  });

  autoUpdater.on("download-progress", (progress) => {
    console.log(
      `⬇️ Progreso descarga: ${Math.round(progress.percent)}% ` +
      `(${Math.round(progress.transferred / 1024 / 1024)}MB / ` +
      `${Math.round(progress.total / 1024 / 1024)}MB)`
    );
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log(`📦 Actualización descargada: versión ${info.version}`);
    dialog.showMessageBox(win, {
      type: "info",
      title: "Actualización lista",
      message: `Se ha descargado la versión ${info.version}. La app se reiniciará para aplicar la actualización.`,
      buttons: ["Reiniciar ahora", "Después"],
    }).then((result) => {
      if (result.response === 0) {
        console.log("🔁 Reiniciando app para instalar update...");
        autoUpdater.quitAndInstall();
      } else {
        console.log("⏸ Usuario decidió instalar más tarde.");
      }
    });
  });
}

app.whenReady().then(() => {
  console.log("🚀 App lista. Creando ventana...");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    console.log("🛑 Todas las ventanas cerradas. Cerrando app...");
    app.quit();
  }
});
