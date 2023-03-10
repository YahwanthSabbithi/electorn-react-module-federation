const {
  app,
  dialog,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
} = require("electron");
const os = require("os");
const path = require("path");
// const fs = require('fs');
// const { menubar } = require('menubar');

const { autoUpdater } = require("electron-updater");
const Config = require("electron-store");
const isDev = require("electron-is-dev");
const isWin = os.platform() === "win32";

let root = path.join(__dirname, "..");
let win;
const persisted = new Config();

const getIcon = (winFileName, macFileName) => {
  return path.join(
    root,
    isWin
      ? `shared/img/icon/win/${winFileName}`
      : `shared/img/icon/mac/${macFileName}`
  );
};
const getTrayIcon = () => {
  const usePurpleTrayIcon = persisted.get("usePurpleTrayIcon");
  return getIcon(
    "shopify_icon_big.ico",
    usePurpleTrayIcon
      ? "shopify_icon_tray.png"
      : "shopify_icon_trayTemplate.png"
  );
};

// Config export
const config = {
  persisted,
  iconWindow: getIcon("shopify_icon_big.ico", "shopify_icon_big.png"),
  isDev: isDev,
  trayEnabledInDev: true,
  iconTray: getTrayIcon(),
  iconTrayUpdate: getIcon(
    "tockler_icon_big_update.ico",
    "tockler_icon_tray_updateTemplate.png"
  ),
};

const createWindow = () => {
  const windowSize = config.persisted.get("windowsize") || {
    width: 1080,
    height: 720,
  };
  // Create the browser window.
  win = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "../dist/public/preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
    title: "Shopify",
    icon: config.iconWindow,
  });

  win.loadURL(
    isDev
      ? "http://localhost:2000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
};

// const setTrayWindow = () => {
//   const tray = new Tray(config.iconTray);

//   const mb = menubar({
//     index: isDev
//       ? 'http://localhost:3000'
//       : `file://${path.join(__dirname, '../build/index.html')}`,
//     tray: tray,
//     //   //  preloadWindow: false, in MAS build shows white tray only
//     preloadWindow: true,
//     showDockIcon: false,

//     browserWindow: {
//       webPreferences: {
//         zoomFactor: 1.0,
//         sandbox: false,
//         nodeIntegration: true,
//         enableRemoteModule: true,
//         contextIsolation: false,
//       },
//       width: 500,
//       height: 600,
//     },
//   });
//   // to prevent white flash
//   // this.menubar.app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');

//   mb.on('after-create-window', () => {
//     // https://github.com/maxogden/menubar/issues/306

//     mb.app?.dock?.hide();
//   });

//   mb.on('after-show', () => {
//     mb.window.webContents.send('focus-tray', 'ping');
//   });
// };

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

//Shortcuts
app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+Q", () => {
    app.quit();
  });
  globalShortcut.register("CommandOrControl+k", () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  globalShortcut.register("CommandOrControl+j", () => {
    win.webContents.send("add-to-cart", "add");
  });
  globalShortcut.register("CommandOrControl+g", () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

let tray;
let routeUpdate;
let checker;

app.whenReady().then(() => {
  // if (!config.isDev || config.trayEnabledInDev) {
  //   setTrayWindow();
  //   app.setAppUserModelId('shopify');
  // }
  tray = new Tray(config.iconTray);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        win.show();
      },
    },
    {
      label: "Run in background",
      click: () => {
        win.hide();
      },
    },
    {
      label: "Headset",
      click: () => {
        routeUpdate = "./OfferedProducts";
        win.webContents.send("change-route", routeUpdate);
      },
    },
    {
      label: "Add to cart",
      click: () => {
        checker = "add";
        win.webContents.send("add-to-cart", checker);
      },
    },
    {
      label: "Dressing",
      click: () => {
        routeUpdate = "./";
        win.webContents.send("change-route", routeUpdate);
      },
    },
    { type: "separator" },
    { label: "Tockler", click: () => win.loadURL("http://localhost:3000") },
    { label: "Shopify", click: () => win.loadURL("http://localhost:3001") },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("shopify");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    tray.popUpContextMenu(contextMenu);
  });
});

app.whenReady().then(() => {
  ipcMain.on("change-route", (_event, value) => {
    console.log(value);
  });
  createWindow();
  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function loadURL(url) {
  win.loadURL(url);
}

module.exports = {
  loadURL,
};

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail: "A new version is being downloaded.",
  };
  dialog.showMessageBox(dialogOpts, (response) => {});
});

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
