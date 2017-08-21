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
  },

  data: {
    loading: {
      page: true,
      user: true,
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
  },

  methods: {
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
  user.getToken().then(function(token) {
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
    var ip_dups = {};
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
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        var ip_addr = ip_regex.exec(candidate)[1];
        //remove duplicates
        if(ip_dups[ip_addr] === undefined)
            callback(ip_addr);
        ip_dups[ip_addr] = true;
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
      console.log("Meu IP: "+app.user.local_ip);
    } else {
      console.log("Meu IP: " + app.user.local_ip + " - Outro: " + ip);
    }
  } else {
    app.user.local_ip = ip;
    console.log("Meu IP: " + app.user.local_ip);
  }
});

if(!app._isMounted) {
  app.$mount('#app');
}

var interval_mdc = setInterval(function() {
  window.mdc.autoInit(document, () => {});
  app.internet_connected = navigator.onLine;
}, 500);
