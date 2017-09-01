Vue.component('add-box-medico', {
  template: $.readFile('templates/system/insert/box_medico/add_box_medico.html'),

  props: {
    exemplo: {
      default: function() {},
    }
  },

  beforeMount: function() {
    var self = this;
    console.log("add-box-medico: beforeMount");
    this.$root.has_logged();
  },

  mounted: function() {
    var self = this;
    window.mdc.autoInit( /* root */ document, () => {});
    console.log("add-box-medico: mounted");
  },

  data: function() {
    var self = this;
    var data = {
      box_medico: {
        fields: {
          apelido: null,
        },
      },
    };

    return data;
  },

  methods: {
    add_box_medico: function(event) {
      if (event) event.preventDefault();

      var self = this;
      new daoclient.DaoBoxMedico().insert(self.box_medico, this.$root.user.token)
        .done(function(data) {
          console.log("done");
          self.box_medico = data[0];
          self.$root.$router.push({
            name: "system-painel"
          });
        })
        .fail(function(data) {
          console.log("Erro no insert médico");
        });
    },
  },

});
