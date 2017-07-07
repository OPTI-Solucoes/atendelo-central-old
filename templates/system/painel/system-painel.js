Vue.component('system-painel', {
	template: $.readFile('templates/system/painel/system-painel.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("System-painel: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("System-painel: mounted");
        if (this.logado) {
            this.testando = this.$root.user.model.fields.testando;
            this.comprou = this.$root.user.model.fields.comprou;
            this.ja_configurou = this.$root.user.model.fields.ip_central;

            if (this.ja_configurou) {this.carregar_maquinas_conectadas()};
        }
    },

    data: function() {
        var self = this;
    	var data = {
            logado: this.$root.is_logged(),
            testando: false,
            comprou: false,
            ja_configurou: false,

            totem_list: [],
            box_list: [],
            monitor_list: [],
		};

    	return data;
    },

	methods: {
        add_totem: function() {
            var self = this;
            this.$root.$router.push({name:"add-totem"});
        },

        delete_totem: function(totem) {
            var self = this;
            new daoclient.DaoTotem().delete(totem, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    var index = self.totem_list.findIndex(function(obj){return obj == totem});
                    console.log(index);
                    for (var i = 0; i < data.length; i++) {
                        self.totem_list.splice(index, 1);
                    }
                })
                .fail(function(data) {
                    console.log("Erro no delete totem");
                });
        },

        add_box: function() {
            var self = this;
            this.$root.$router.push({name:"add-box"});
        },

        delete_box: function(box) {
            var self = this;
            new daoclient.DaoBox().delete(box, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    var index = self.box_list.findIndex(function(obj){return obj == box});
                    console.log(index);
                    for (var i = 0; i < data.length; i++) {
                        self.box_list.splice(index, 1);
                    }
                })
                .fail(function(data) {
                    console.log("Erro no delete box");
                });
        },

        add_monitor: function() {
            var self = this;
            this.$root.$router.push({name:"add-monitor"});
        },

        delete_monitor: function(monitor) {
            var self = this;
            new daoclient.DaoMonitor().delete(monitor, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    var index = self.monitor_list.findIndex(function(obj){return obj == monitor});
                    console.log(index);
                    for (var i = 0; i < data.length; i++) {
                        self.monitor_list.splice(index, 1);
                    }
                })
                .fail(function(data) {
                    console.log("Erro no delete monitor");
                });
        },

        open_subsystem: function() {
            this.$root.$router.push({name: "subsystem"});
        },

        carregar_maquinas_conectadas: function() {
            var self = this;
            new daoclient.DaoTotem().list(this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    for (var i = 0; i < data.length; i++) {
                        self.totem_list.push(data[i]);
                    }
                })
                .fail(function(data) {
                    console.log("Erro no list totem");
                });

            new daoclient.DaoBox().list(this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    for (var i = 0; i < data.length; i++) {
                        self.box_list.push(data[i]);
                    }
                })
                .fail(function(data) {
                    console.log("Erro no list box");
                });

            new daoclient.DaoMonitor().list(this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    for (var i = 0; i < data.length; i++) {
                        self.monitor_list.push(data[i]);
                    }
                })
                .fail(function(data) {
                    console.log("Erro no list monitor");
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
                    console.log("Erro no login");
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
            }  else if (num == 2) {
                this.etapa_2 = true;
            }  else if (num == 3) {
                this.etapa_3 = true;
            } else if (num == 4) {
                this.etapa_4 = true;
            } else if (num == 5) {
                this.$root.$router.push({name: "home"});
            }
        }
	},

});