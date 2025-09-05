const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,   // permite usar require() en frontend
      contextIsolation: false, // lo desactivamos para simplificar
    },
  });

  win.loadFile("index.html"); // aquí cargará tu interfaz
}

app.whenReady().then(createWindow);

// Para que en Mac no se cierre todo al cerrar ventana
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
