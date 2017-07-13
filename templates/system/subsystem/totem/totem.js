Vue.component('totem', {
  template: $.readFile('templates/system/subsystem/totem/totem.html'),

  data: function() {
    var self = this;
    var data = {
      con_ws: null,
      nome_paciente: null,
      especialidade: null,
      list_especialidades: null,
      enviando: false,
      dados_incompletos: false,
      json_to_send: {
        header:{action: null},
        body:{},
      },
    };
    return data;
  },

  beforeMount: function() {
    var self = this;
    // this.con_ws = new WebSocket(settings.websocketPath+"totem/");
    this.con_ws = io(settings.websocketPath+"totem");
  },

  mounted: function() {
    var self = this;
    window.mdc.autoInit(/* root */ document, () => {});
    this.select_all_especialidades();
    init_ws_totem(this);
  },

  methods: {
    solicitar_senha: function() {
      if (!this.enviando) {
        console.log(this.nome_paciente);
        console.log(this.especialidade);

        if (this.nome_paciente && this.especialidade) {
          this.json_to_send = {
            'header':{'action': 'socilitar_nova_senha'},
            'body':{'paciente': this.nome_paciente,
            'especialidade': this.especialidade,
            'fila': "NOR",
          },
        }

        console.log(this.json_to_send);
        this.con_ws.emit(this.json_to_send.header.action, JSON.stringify(this.json_to_send));

        this.enviando = true;
      } else {
        this.dados_incompletos = true;
      }
    } else {
    }
  },

  completar_dados: function() {
    this.dados_incompletos = false;
  },

  select_all_especialidades: function() {
    var self = this;
    new daoclient.Especialidade().select_all()
    .done(function(data) {
      console.log("done");
      self.list_especialidades = data;
    })
    .fail(function(data) {
      console.log("fail");
      self.list_especialidades = null;
    });
  },

}
});

var init_ws_totem = function(comp) {
  comp.con_ws.on('connect', function () {
    console.log('Connected');
    comp.enviando = false;
    comp.nome_paciente = null;
    comp.especialidade = null;
  });

  comp.con_ws.on('disconnect', function(){
    console.log('Disconnect');
  });

  comp.con_ws.on('solicitar_nova_senha', function(data){
    console.log("solicitar_nova_senha event");
    console.log(data);
    comp.$root.mostrar_msg("Nova senha solicitada com sucesso!");
    comp.enviando = false;
    comp.nome_paciente = null;
    comp.especialidade = null;
  });

  comp.con_ws.on('erro_solicitar_nova_senha', function(data){
    console.log("erro_solicitar_nova_senha event");
    console.log(data);
    comp.enviando = false;
  });

  // comp.con_ws.onopen = function () {
  // 	console.log('Totem de senhas conectado!');
  // };

  // comp.con_ws.onerror = function (error) {
  // 	console.log(error);
  // 	console.log('WebSocket Error ' + error);
  // };

  // comp.con_ws.onmessage = function (e) {
  //     var json = JSON.parse(e.data);
  // 	if (json) {
  //         console.log(json.header.action);
  // 		if (json.header.action == 'solicitar_nova_senha') {
  // 			console.log("Solicitação de senha aceita!");
  // 			app.enviando = false;
  // 			app.nome_paciente = null;
  // 			app.especialidade = null;
  // 		} else if (json.header.action == 'erro_solicitar_nova_senha') {
  // 			app.enviando = false;
  // 		}
  // 	} else {
  //         console.error("Json nulo");
  // 	}

  // };
}
