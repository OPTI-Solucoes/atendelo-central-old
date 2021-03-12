var _router = new VueRouter({
  routes: [
    { name: 'login', path: '/login', component: {
      template: '<login ref="login" />' }
    },

    { name: 'inserir-usuario', path: '/registrar', component: {
      template: '<inserir-usuario ref="registrar" />' }
    },

    // Config
    { name: 'system-config', path: '/system-config', component: {
      template: '<system-config ref="system-config" />' }
    },

    // Painel
    { name: 'home', path: '/', component: {
      template: '<system-painel ref="system-painel" />' }
    },

    // Add
    { name: 'add-prioridade', path: '/add-prioridade', component: {
      template: '<add-prioridade ref="add-prioridade" />' }
    },
     // Add
     { name: 'add-tipo-atendimento', path: '/add-tipo-atendimento', component: {
      template: '<add-tipo-atendimento ref="add-tipo-atendimento" />' }
    },

    // Add
    { name: 'add-box', path: '/add-box', component: {
      template: '<add-box ref="add-box" />' }
    },

    { name: 'add-box-medico', path: '/add-box-medico', component: {
      template: '<add-box-medico ref="add-box-medico" />' }
    },

    { name: 'add-monitor', path: '/add-monitor', component: {
      template: '<add-monitor ref="add-monitor" />' }
    },

    { name: 'add-totem', path: '/add-totem', component: {
      template: '<add-totem ref="add-totem" />' }
    },
  ]
});

var app = new Vue({
  router: _router,

  mounted: function() {
    var self = this;
    console.log("App: mounted");
    var MDCSnackbar = mdc.snackbar.MDCSnackbar;
    self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
    self.loading.page = false;

    var MDCDrawer = mdc.drawer.MDCDrawer;
    self.drawer = new MDCDrawer(document.querySelector('.mdc-drawer'));

    // Listen for messages
    const {ipcRenderer} = require('electron');
    ipcRenderer.on('message_index', function(event, text) {
      if (text == "checking-for-update") {
        self.loading.update = true;
      } else if (text == "update-available") {
        self.loading.update = true;
        self.loading.downloading = true;
      } else if (text == "update-not-available") {
        self.loading.update = false;
      } else if (text.indexOf("error") != -1) {
        window.alert(text);
        self.loading.update = false;
      } else if (text.indexOf("download-progress") != -1) {
        // self.download_progress = text;
      } else if (text == "update-downloaded") {
        self.download_message = "Em 5 segundos iremos atualizar o aplicativo..."
      } else if (text == "cant_update") {
        self.loading.update = false;
      } else {
        document.getElementById('title').innerText = "Line-it - Server " + text;
      }
    });

    self.updater();
    // END UPDATER
  },

  data: {
    drawer: null,
    is_server: true,
    iplist: null,
    loading: {
      page: true,
      user: true,
      // UPDATER
      update: true,
      downloading: false,
      download_progress: 0,
      download_message: "",
    },
    user: {
      local_ip: null,
      token: null,
      firebase: null,
      model: null,
    },
    registrando_usuario: false,
    snackbar: null,
    internet_connected: false,

    updater: require('electron').remote.require("./index").init_updater,
  },

  methods: {

    atualizar_server: function() {
			var self = this;
			new daoclient.DaoClinica().configurar_central(this.$root.user.token, this.$root.user.local_ip)
			.done(function(data) {
        self.user.model = data[0];
        self.is_server = true;
        console.log('servidor atualizado', self.$root.user.local_ip);
				self.mostrar_msg("Servidor atualizado!");
			})
			.fail(function(data) {
				console.log("Erro");
			});
    },
    
    has_logged: function(func) {
      var self = this;
      if(self.user.token && self.user.model) {
        self.loading.page = false;
        self.loading.user = false;
      } else {
        self.mostrar_msg("Você ainda não está logado");
        self.$router.push({name: "login"});
      }
    },

    is_logged: function() {
      if (this.user.model) {
        return true;
      } else {
        return false;
      }
    },

    terminar_registro: function() {
      var self = this;
      self.loading.user = false;
      self.loading.page = false;
      self.$router.push({name: "inserir-usuario"});
    },

    mostrar_msg: function(msg) {
      var self = this;
      self.snackbar.show({message: msg});
    },
  },

});

var router = {};
router.firebase = {};

router.firebase.login = function(user) {
  console.log("Logando firebase...");
  user.getIdToken().then(function(token) {
    console.log("getToken firebase");
    app.user.token = token;
    app.user.firebase = user;
    if (!app.registrando_usuario) {
      console.log("logando DaoClient...");
      new daoclient.DaoClinica().get(token)
      .done(function(data) {
        data = data[0];
        console.log("get DaoClinica");
        console.log(data);

        app.user.model = data;
        app.loading.user = false;

        settings.websocketPath = "http://"+app.user.model.fields.ip_central+":3000/";
        console.log("websocketPath: "+settings.websocketPath);

        if(!app._isMounted) {
          app.$mount('#app');
        }

        app.$router.push({name: "home"});
      })
      .fail(function(data) {
        console.error("Erro no login");
        console.log(data);
        app.loading.user = false;

        if (data.status == 400) {
          app.$router.push({name: "inserir-usuario"})
        }
      });
    }
  });
};

router.firebase.logout = function(user) {
  app.user.token = null;
  app.user.firebase = null;
  app.user.model = null;

  app.loading.user = false;

  if(!app._isMounted) {
    app.$mount('#app');
  }
};

// executa ao carregar a pagina
firebase.auth().onAuthStateChanged(function(user) {
  app.loading.user = true;
  if (user) {
    console.log("Logando...");
    router.firebase.login(user);
  } else {
    console.log("Deslogando...");
    router.firebase.logout(user);
  }
});

// get the IP addresses associated with an account
function getIPs(callback){
    //compatibility for firefox and chrome
    var RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;
    var useWebKit = !!window.webkitRTCPeerConnection;
    //bypass naive webrtc blocking using an iframe
    if(!RTCPeerConnection){
        //NOTE: you need to have an iframe in the page right above the script tag
        //
        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
        //<script>...getIPs called in here...
        //
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection
            || win.mozRTCPeerConnection
            || win.webkitRTCPeerConnection;
        useWebKit = !!win.webkitRTCPeerConnection;
    }
    //minimal requirements for data connection
    var mediaConstraints = {
        optional: [{RtpDataChannels: true}]
    };
    var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
    //construct a new RTCPeerConnection
    var pc = new RTCPeerConnection(servers, mediaConstraints);
    function handleCandidate(candidate){
        console.log(candidate)
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        var ips = ip_regex.exec(candidate);
        var ip_addr = null;
        if(ips && ips.length > 0){
          ip_addr = ips[1];
        }
        if(ip_addr){
          //remove duplicates
          if(!app.iplist){
            app.iplist = {};
            callback(ip_addr);
          }
          if(app.iplist[ip_addr] === undefined){
            app.iplist[ip_addr] = true;
          }
        }
    }
    //listen for candidate events
    pc.onicecandidate = function(ice){
        //skip non-candidate events
        if(ice.candidate) handleCandidate(ice.candidate.candidate);
    };
    //create a bogus data channel
    pc.createDataChannel("");
    //create an offer sdp
    pc.createOffer(function(result){
        //trigger the stun server request
        pc.setLocalDescription(result, function(){}, function(){});
    }, function(){});
    //wait for a while to let everything done
    setTimeout(function(){
        //read candidate info from local description
        var lines = pc.localDescription.sdp.split('\n');
        lines.forEach(function(line){
            if(line.indexOf('a=candidate:') === 0)
                handleCandidate(line);
        });
    }, 100);
}
//Test: Print the IP addresses into the console
getIPs(function(ip){
  if (app.user.local_ip) {
    if (app.user.local_ip.indexOf('.') == -1) {
      app.user.local_ip = ip;
      console.log("Meu IP (1): "+app.user.local_ip);
    } else {
      console.log("Meu IP: (2)" + app.user.local_ip + " - Outro: " + ip);
    }
  } else {
    app.user.local_ip = ip;
    console.log("Meu IP: (3)" + app.user.local_ip);
  }
});

if(!app._isMounted) {
  app.$mount('#app');
}

var interval_mdc = setInterval(function() {
  window.mdc.autoInit(document, () => {});
  app.internet_connected = navigator.onLine;
}, 500);

var interval_refresh_token_firebase = setInterval(function() {
  console.log("Refreshing token...");
  app.user.firebase.getIdToken().then(function(token) {
    console.log("Token refreshed!");
    app.user.token = token;
  });
}, 1200000);
