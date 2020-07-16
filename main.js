const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// listen for app to be ready
app.on("ready", function () {
  // create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file",
      slashes: true,
    })
  );

  mainWindow.on("closed", function () {
    app.quit();
  });

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // insert menu
  Menu.setApplicationMenu(mainMenu);

  // removes menu bar
  // mainWindow.removeMenu();
});

//handre create add window
function createAddWindow() {
  // create new window
  addWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 600,
    height: 400,
    title: "Add Shopping List Item",
  });

  //load html into window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file",
      slashes: true,
    })
  );

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // insert menu
  Menu.setApplicationMenu(mainMenu);

  // garbage collection handle
  addWindow.on("close", function () {
    addWindow = null;
  });
}

// catch item:add
ipcMain.on("item:add", function (e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

//menu bar template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Items",
        accelerator: process.platform == "darwin" ? "Command+D" : "Ctrl+D",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// if mac, add empty object to menu bar
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

// add dev tools if not in prod
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "DEV TOOLS",
    submenu: [
      {
        label: "Toggle devTools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
      },
      {
        role: "reload",
      },
    ],
  });
}
