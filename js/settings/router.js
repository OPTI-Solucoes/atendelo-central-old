var _router = new VueRouter({
  routes: [
    // { name: 'home', path: '/', component: {
    //   template: '<home ref="home" />' }
    // },

    { name: 'login', path: '/login', component: {
      template: '<login ref="login" />' }
    },

    { name: 'inserir-usuario', path: '/registrar', component: {
      template: '<inserir-usuario ref="registrar" />' }
    },

    // { name: 'saiba-mais', path: '/saibamais', component: {
    //   template: '<saiba-mais ref="saibamais" />' }
    // },

    // Config
    { name: 'system-config', path: '/system-config', component: {
      template: '<system-config ref="system-config" />' }
    },

    // Painel
    { name: 'home', path: '/', component: {
      template: '<system-painel ref="system-painel" />' }
    },

    // Add
    { name: 'add-totem', path: '/add-totem', component: {
      template: '<add-totem ref="add-totem" />' }
    },

    { name: 'add-box', path: '/add-box', component: {
      template: '<add-box ref="add-box" />' }
    },

    { name: 'add-monitor', path: '/add-monitor', component: {
      template: '<add-monitor ref="add-monitor" />' }
    },

    // Activate
    { name: 'activate-totem', path: '/activate-totem', component: {
      template: '<activate-totem ref="activate-totem" />' }
    },

    { name: 'activate-box', path: '/activate-box', component: {
      template: '<activate-box ref="activate-box" />' }
    },

    { name: 'activate-monitor', path: '/activate-monitor', component: {
      template: '<activate-monitor ref="activate-monitor" />' }
    },

    // Subsystem
    { name: 'subsystem', path: '/subsystem', component: {
      template: '<subsystem ref="subsystem" />' }
    },

    { name: 'totem', path: '/totem', component: {
      template: '<totem ref="totem" />' }
    },

    { name: 'box', path: '/box', component: {
      template: '<box ref="box" />' }
    },

    { name: 'monitor', path: '/monitor', component: {
      template: '<monitor ref="monitor" />' }
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

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
pc.createDataChannel("");    //create a bogus data channel
pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
pc.onicecandidate = function(ice){  //listen for candidate events
  if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
  var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
  app.user.local_ip = myIP;
  console.log("Local IP pego: " + app.user.local_ip);
  pc.onicecandidate = noop;
};

if(!app._isMounted) {
  app.$mount('#app');
}
