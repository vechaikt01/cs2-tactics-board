const { contextBridge, ipcRenderer } = require("electron");

// Exposes the same window.storage.get/set/delete/list shape the React
// component already calls, backed by the local JSON file in main.js.
contextBridge.exposeInMainWorld("storage", {
  get: (key) => ipcRenderer.invoke("storage:get", key),
  set: (key, value) => ipcRenderer.invoke("storage:set", key, value),
  delete: (key) => ipcRenderer.invoke("storage:delete", key),
  list: (prefix) => ipcRenderer.invoke("storage:list", prefix),
});
