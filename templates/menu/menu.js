// $(document).ready(function() {

Vue.component('menu-vertical', {
  template: $.readFile('templates/menu/menu.html'),

  data: function() {
    var self = this;
    var rc_data = {
      select: null,
			elec: require('electron').remote.require("./index"),
    };
    return rc_data;
  },

  mounted: function() {
    var self = this;
    mdc.autoInit();

    var root = document.getElementById('outline-js-select');
    console.log(root);    
    self.select = new mdc.select.MDCSelect(root);
    root.addEventListener('change', () => {
      self.$root.atualizar_server();        
    });
		document.querySelector('.demo-menu').addEventListener('click', function() {
			self.$root.drawer.open = true;
		});

  },

  methods: {
    deslogar_firebase: function() {
      var self = this;
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
				self.elec.close_app();
      }, function(error) {
        // An error happened.
				console.log(error);
      });
    },

  },

});
