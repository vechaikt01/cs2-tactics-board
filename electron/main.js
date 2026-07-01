const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

const isDev = !app.isPackaged;

function getStorePath() {
  return path.join(app.getPath("userData"), "store.json");
}

function loadSeed() {
  const seedPath = path.join(__dirname, "..", "seed", "default-data.json");
  try {
    return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  } catch (e) {
    return { maps: [], tactics: [], mapImages: {} };
  }
}

function loadStore() {
  const p = getStorePath();
  if (!fs.existsSync(p)) {
    const seed = loadSeed();
    const initial = {
      "cs2-tactics-maps": JSON.stringify(seed.maps || []),
      "cs2-tactics-data": JSON.stringify(seed.tactics || []),
      "cs2-tactics-map-images": JSON.stringify(seed.mapImages || {}),
    };
    fs.writeFileSync(p, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch (e) {
    return {};
  }
}

function saveStore(store) {
  fs.writeFileSync(getStorePath(), JSON.stringify(store, null, 2), "utf-8");
}

let store = loadStore();

// Mirrors the get/set/delete/list shape the React app already expects from
// Claude's `window.storage` API, so the renderer code needs no changes.
ipcMain.handle("storage:get", (_evt, key) => {
  if (!(key in store)) return null;
  return { key, value: store[key], shared: false };
});

ipcMain.handle("storage:set", (_evt, key, value) => {
  store[key] = value;
  saveStore(store);
  return { key, value, shared: false };
});

ipcMain.handle("storage:delete", (_evt, key) => {
  const existed = key in store;
  delete store[key];
  saveStore(store);
  return { key, deleted: existed, shared: false };
});

ipcMain.handle("storage:list", (_evt, prefix) => {
  const keys = Object.keys(store).filter((k) => !prefix || k.startsWith(prefix));
  return { keys, prefix, shared: false };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: "#0E1117",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    // Checks the GitHub Releases of the repo configured in package.json's
    // "build.publish" section, downloads updates in the background and
    // prompts the user to restart once ready.
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
