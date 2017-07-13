Vue.component('box', {
  template: $.readFile('templates/system/subsystem/box/box.html'),

  data: function() {
    var self = this;

    data = {
      con_ws: null,

      cards_classes: {
        card_desativado: "card horizontal white black-text",
        card_um_ativado: "card horizontal red accent-1 white-text",
        card_dois_ativado: "card horizontal green lighten-1 white-text",
        card_tres_ativado: "card horizontal blue darken-1 white-text",
      },

      filas: [
        {pk: 0, ativa: false, classificacao: "Medico", iniciais: "MED"},
        {pk: 1, ativa: false, classificacao: "Preferencial", iniciais: "PRE"},
        {pk: 2, ativa: false, classificacao: "Normal", iniciais: "NOR"},
      ],

      senha: null,
      // senha: {pk: 0, fila: "TST", numero: 1, paciente: "João Marcos Silva", especialidade: "Pilates"},
      carregando: false,

      // Paciente
      paciente: {
        nome: null,
        cpf: null,
        senha: null,
        especialidade: null,
      },
      enviando: false,
      enviado_sucesso: false,
      dados_incompletos: false,

      // Conometro
      conometro: new Timer(),
      tempo_decorrido: null,

      // Json to send
      json_to_send: {
        header:{action: null},
        body:{
          senha:{
            _id:null,
            tempo_decorrido:null,
          },
          fila:{
            iniciais:null
          },
          fila_manual:{
            iniciais:null
          }
        },
      },

      chamar_proximo: true,
      fila_manual: null,

    };

    return data;
  },

  beforeMount: function() {
    var self = this;
    // this.con_ws = new WebSocket(settings.websocketPath+"box/");
    this.con_ws = io(settings.websocketPath+"box");
  },

  mounted: function () {
    var self = this;
    window.mdc.autoInit(/* root */ document, () => {});
    init_ws_box(this);
  },

  methods: {
    proxima_senha: function() {
      this.conometro.stop();
      this.paciente = null;
      this.enviando = false;
      this.enviado_sucesso = false;
      this.dados_incompletos = false;

      this.json_to_send.header.action = 'proxima_senha';
      if (this.senha) {
        console.log("tem senha");
        this.json_to_send.body.senha._id = this.senha._id;
        this.json_to_send.body.tempo_decorrido = this.tempo_decorrido;
        this.json_to_send.body.fila.iniciais = this.senha.fila;
        this.json_to_send.body.fila_manual.iniciais = null;
      } else {
        console.log("nao tem senha");
        this.json_to_send.body.senha._id = null;
        this.json_to_send.body.senha.tempo_decorrido = null;
        this.json_to_send.body.fila.iniciais = null;
        this.json_to_send.body.fila_manual.iniciais = null;
      }

      this.carregando = true;
      this.con_ws.emit(this.json_to_send.header.action, JSON.stringify(this.json_to_send));
      console.log("emit...");
      this.senha = null;
    },

    proxima_senha_fila_manual: function() {
      this.conometro.stop();
      this.paciente = null;
      this.enviando = false;
      this.enviado_sucesso = false;
      this.dados_incompletos = false;

      this.json_to_send.header.action = 'proxima_senha';
      if (this.senha) {
        console.log("tem senha");
        this.json_to_send.body.senha._id = this.senha._id;
        this.json_to_send.body.tempo_decorrido = this.tempo_decorrido;
        this.json_to_send.body.fila.iniciais = this.senha.fila;
        this.json_to_send.body.fila_manual.iniciais = this.fila_manual;
      } else {
        console.log("nao tem senha");
        this.json_to_send.body.senha._id = null;
        this.json_to_send.body.senha.tempo_decorrido = null;
        this.json_to_send.body.fila.iniciais = null;
        this.json_to_send.body.fila_manual.iniciais = this.fila_manual;
      }

      this.carregando = true;
      this.con_ws.emit(this.json_to_send.header.action, JSON.stringify(this.json_to_send));
      this.senha = null;
    },

    cadastrar_paciente: function() {
      if (!this.enviando && !this.dados_incompletos) {
        if (this.paciente.nome && this.paciente.cpf && this.paciente.senha && this.paciente.especialidade) {
          var self = this;
          this.enviando = true;

          new daoclient.Paciente().insert_or_update(this.paciente)
          .done(function(data) {
            console.log("done");
            self.enviando = false;
            self.enviado_sucesso = true;
            comp.$root.mostrar_msg("Cliente verificado!");
          })
          .fail(function(data) {
            console.log("fail");
            self.enviando = false;
            self.enviado_sucesso = false;
            comp.$root.mostrar_msg("Não foi possível verificar o cliente.");
          });
        } else {
          this.dados_incompletos = true;
        }
      }
    },

    escolher_fila: function(fila) {
      for (var i = 0; i < this.filas.length; i++) {
        if (fila == this.filas[i]) {
          if (fila.ativa) {
            this.fila_manual = null;
            this.filas[i].ativa = false;
            break;
          } else {
            this.fila_manual = this.filas[i].iniciais;
            this.filas[i].ativa = true;
          }
        } else {
          this.filas[i].ativa = false
        }
      }
      console.log(this.fila_manual);
    },

    completar_dados: function() {
      this.dados_incompletos = false;
    },

  },

});

var init_ws_box = function(comp) {
  comp.con_ws.on('connect', function () {
    console.log('Connected');
    // comp.proxima_senha();
  });

  comp.con_ws.on('disconnect', function(){
    console.log('Disconnect');
  });

  comp.con_ws.on('proxima_senha', function(data){
    console.log("proxima_senha event");

    if (comp.chamar_proximo) {
      comp.senha = data.body.senha;
      console.log(comp.senha);

      comp.tempo_decorrido = null;
      comp.conometro.start();
      comp.conometro.addEventListener('secondsUpdated', function (e) {
        comp.tempo_decorrido = comp.conometro.getTimeValues().toString();
      });

      comp.paciente = {};
      comp.paciente['nome'] = comp.senha.paciente;
      comp.paciente['cpf'] = null;
      comp.paciente['senha'] = comp.senha.numero;
      comp.paciente['especialidade'] = comp.senha.especialidade;

      comp.carregando = false;

      setTimeout(function() {
        window.mdc.autoInit(/* root */ document, () => {});
      }, 500);
    } else {
      comp.chamar_proximo = true;
    }

  });

  comp.con_ws.on('nova_senha_em_espera', function(data){
    console.log("nova_senha_em_espera event");
    console.log(data);
    comp.$root.mostrar_msg("Existem senhas em espera!");
    //      if (!comp.senha) {
    //       comp.senha = null;
    // comp.proxima_senha();
    //      }
  });

  comp.con_ws.on('nenhuma_senha', function(data){
    console.log("nenhuma_senha event");
    console.log(data);
    comp.senha = null;
    comp.carregando = false;
    if (comp.fila_manual) {
      comp.$root.mostrar_msg("Nenhuma senha em espera nesta fila");
    } else {
      comp.$root.mostrar_msg("Nenhuma senha em espera");
    }
  });

  // comp.con_ws.onopen = function () {
  // 	console.log('Administrador conectado!');
  // 	comp.proxima_senha();
  // };

  // comp.con_ws.onerror = function (error) {
  // 	console.dir(error);
  // 	console.log('WebSocket Error ' + error);
  // };

  // comp.con_ws.onmessage = function (e) {
  //        var json = JSON.parse(e.data);
  //        console.log(json);
  // 	if (json) {
  //            console.log(json.header.action);
  // 		if (json.header.action == 'proxima_senha') {
  // 			comp.senha = json.body.senha[0];

  // 			comp.tempo_decorrido = null;
  // 			comp.conometro.start();
  // 			comp.conometro.addEventListener('secondsUpdated', function (e) {
  // 			    comp.tempo_decorrido = comp.conometro.getTimeValues().toString();
  // 			});

  // 			comp.paciente.nome = comp.senha.fields.paciente;
  // 			comp.paciente.cpf = null;
  // 			comp.paciente.senha = comp.senha.fields.numero;
  // 			comp.paciente.especialidade = comp.senha.fields.especialidade;

  // 			comp.carregando = false;

  // 		} else if (json.header.action == "gerar_historico") {
  // 			console.error("Gerar histórico de hoje?");
  // 		} else if (json.header.action == "nenhuma_senha") {
  // 			comp.senha = null;
  // 			comp.carregando = false;
  // 		}
  // 	} else {
  //            console.error("Json nulo");
  // 	}
  // };
}
