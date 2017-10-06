const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray
} = require('electron');
const {
  autoUpdater
} = require("electron-updater");
const log = require('electron-log');
const path = require('path');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let appIcon = null;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "I9Fila - Server",
  });

  // Icon tray
  win.on('minimize', function(event) {
    event.preventDefault();
    win.hide();
  });

  win.on('close', function(event) {
    if (!app.isQuiting) {
      event.preventDefault()
      win.hide();
    }
    return false;
  });


  var iconPath = path.join(__dirname, "icons/24x24.png")
  appIcon = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Abrir Central',
      click: function() {
        win.show();
      }
    },
    {
      label: 'Sair',
      click: function() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  appIcon.setContextMenu(contextMenu);

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// UPDATER

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message_index', text);
}

exports.init_updater = function() {
  log.info('Updater starting...');

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('checking-for-update');
  });
  autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('update-available');
  });
  autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('update-not-available');
  });
  autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('error : ' + err);
  });
  autoUpdater.on('download-progress', (ev, progress) => {
    // sendStatusToWindow('download-progress: ' + progress.percent + "%");
  });
  autoUpdater.on('update-downloaded', (ev, info) => {
    sendStatusToWindow('update-downloaded');
    setTimeout(function() {
      var isSilent = false;
      var isForceRunAfter = true;
      autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
    }, 5000);
  });

  sendStatusToWindow("v" + app.getVersion());
  var os = require('os');
  if (os.platform() != 'win32') {
    sendStatusToWindow("cant_update");
  } else {
    var DEBUG = false;
    if (DEBUG) {
      log.error('DEBUG TRUE');
      sendStatusToWindow("cant_update");
    } else {
      autoUpdater.checkForUpdates();
    }
  }
}

// END UPDATER

var server = require('http').createServer();

var io = require('socket.io')(server);
var geral = io.of('/geral');
var box = io.of('/box');
var box_sala = io.of('/box_sala');
var monitor = io.of('/monitor');
var totem = io.of('/totem');

var consumers = require("./consumers.js");
consumers.connect_to_database();

var sockets = {
  geral: geral,
  box: box,
  box_sala: box_sala,
  monitor: monitor,
  totem: totem
};

io.on('connection', function(client) {
  console.log('user connected');

  client.on("disconnect", function() {
    console.log("Disconnect");
  });
});

geral.on('connection', function(client) {
  console.log('user connected to Geral');

  client.on("disconnect", function() {
    console.log("Disconnect from Geral");
  });

  client.on("add_fila_sala", function(incoming_json) {
    console.log("add_fila_sala event");
    consumers.add_fila_sala(incoming_json, sockets);
  });
})

box.on('connection', function(client) {
  console.log('user connected to Box');

  client.on("disconnect", function() {
    console.log("Disconnect from Box");
  });

  client.on("get_proxima_senha", function(incoming_json) {
    console.log("get_proxima_senha");
    consumers.get_proxima_senha(incoming_json, sockets, client);
  });

  client.on("atender_senha_box", function(incoming_json) {
    console.log("atender_senha_box");
    consumers.atender_senha_box(incoming_json, sockets, client);
  });

  client.on("desistir_atender_senha", function(incoming_json) {
    console.log("desistir_atender_senha");
    consumers.desistir_atender_senha(incoming_json, sockets);
  });

  client.on("select_all_filas_box", function(incoming_json) {
    console.log("select_all_filas_box event");
    consumers.select_all_filas_box(incoming_json, sockets, client);
  });

  client.on("check_me", function(incoming_json) {
    console.log("check_me event");
    consumers.check_box(incoming_json, client);
  });

  // client.on("activate_me", function(incoming_json) {
  //   console.log("activate_me event");
  //   consumers.activate_box(incoming_json, client);
  // });
});

box_sala.on('connection', function(client) {
  console.log('user connected to Box_Sala');

  client.on("disconnect", function() {
    console.log("Disconnect from Box_Sala");
  });

  client.on("atender_senha", function(incoming_json) {
    console.log("atender_senha event");
    consumers.atender_senha_sala(incoming_json, sockets, client);
  });

  client.on("edit_fila", function(incoming_json) {
    console.log("edit_fila event");
    consumers.edit_fila(incoming_json, sockets, client);
  });

  client.on("desistir_atender_senha", function(incoming_json) {
    console.log("desistir_atender_senha event");
    consumers.desistir_atender_senha_sala(incoming_json, sockets, client);
  });

  client.on("select_all_filas", function(incoming_json) {
    console.log("select_all_filas event");
    consumers.select_all_filas(incoming_json, sockets, client);
  });

  client.on("check_me", function(incoming_json) {
    console.log("check_me event");
    consumers.check_box(incoming_json, client);
  });

  // client.on("activate_me", function(incoming_json) {
  //   console.log("activate_me event");
  //   consumers.activate_box(incoming_json, client);
  // });
});

monitor.on('connection', function(client) {
  console.log('user connected to Monitor');

  client.on("disconnect", function() {
    console.log("Disconnect from Monitor");
  });

  client.on("get_view", function(incoming_json) {
    console.log("get_view event");
    consumers.get_view(incoming_json, sockets, client);
  });

  client.on("check_me", function(incoming_json) {
    console.log("check_me event");
    consumers.check_monitor(incoming_json, client);
  });

  // client.on("activate_me", function(incoming_json) {
  //   console.log("activate_me event");
  //   consumers.activate_monitor(incoming_json, client);
  // });
});

totem.on('connection', function(client) {
  console.log('user connected to Totem');

  client.on("disconnect", function() {
    console.log("Disconnect from Totem");
  });

  client.on("socilitar_nova_senha", function(incoming_json) {
    console.log("socilitar_nova_senha event");
    consumers.insert_senha(incoming_json, sockets, client);
  });

  client.on("check_me", function(incoming_json) {
    console.log("check_me event");
    consumers.check_totem(incoming_json, client);
  });

  client.on("ding", function() {
    console.log("ding");
    client.emit("dong", "dong");
  });

  // client.on("activate_me", function(incoming_json) {
  //   console.log("activate_me event");
  //   consumers.activate_totem(incoming_json, client);
  // });
});

exports.close_app = function() {
	app.isQuiting = true;
  app.quit();
}

exports.init_io_server = function() {
  if (!server.listening) {
    var porta = 3000;
    server.listen(porta, "0.0.0.0", function() {
      console.log('Socket IO listening on port ' + porta);
    });
  }
}
