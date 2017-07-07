Vue.component('system-config', {
	template: $.readFile('templates/system/config/system-config.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("System-config: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("System-config: mounted");
        if (this.logado) {
            this.testando = this.$root.user.model.fields.testando;
            this.comprou = this.$root.user.model.fields.comprou;
            this.ja_configurou = this.$root.user.model.fields.ip_central;
            if (this.ja_configurou) {
                this.$root.$router.push({name: "system-painel"});
            }
            this.etapa_0 = true;
        }
    },

    data: function() {
        var self = this;
    	var data = {
            logado: this.$root.is_logged(),
            testando: false,
            comprou: false,
            ja_configurou: false,
            ip_central: self.$root.user.local_ip,
            registrando: false,
            registro_ok: false,
            registro_erro: false,
            etapa_0: false,
            etapa_1: false,
            etapa_2: false,
            etapa_3: false,

		};
    	return data;
    },

	methods: {
        registrar_central: function(event) {
            if (event) event.preventDefault();

            var self = this;
            self.registrando = true;
            new daoclient.DaoClinica().configurar_central(this.$root.user.token, this.ip_central)
                .done(function(data) {
                    console.log("done");
                    self.$root.user.model = data[0];
                    self.registrando = false;
                    self.registro_ok = true;
                })
                .fail(function(data) {
                    console.log("Erro");
                    self.registrando = false;
                    self.registro_erro = true;
                });
        },

        iniciar_periodo_teste: function() {
            var self = this;
            new daoclient.DaoClinica().iniciar_periodo_teste(this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.$root.user.model = data[0];
                    self.testando = true;
                })
                .fail(function(data) {
                    console.log("Erro");
                });
        },

        proxima_etapa: function(event, num) {
            if (event) event.preventDefault();

            this.etapa_0 = false;
            this.etapa_1 = false;
            this.etapa_2 = false;
            this.etapa_3 = false;

            if (num == 0) {
                this.etapa_0 = true;
            } else if (num == 1) {
                this.etapa_1 = true;
                window.mdc.autoInit(/* root */ document, () => {});
            }  else if (num == 2) {
                this.etapa_2 = true;
            }  else if (num == 3) {
                this.etapa_3 = true;
            } else if (num == 4) {
                this.$root.$router.push({name: "system-painel"});
            }
        }
	},

});