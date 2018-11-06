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
			console.log('--- central ip ---')
			console.log(this.$root.user.local_ip)
			console.log(this.$root.user.model.fields.ip_central)
			
			var ip_central = this.$root.user.model.fields.ip_central;
			if(ip_central != this.$root.user.local_ip){
			  if(this.$root.iplist[ip_central]){
				this.$root.user.local_ip = ip_central;
			  }
			}
			this.$root.is_server = this.$root.user.local_ip == ip_central;

			if (this.ja_configurou) {
				this.carregar_maquinas_conectadas();
				this.index.init_io_server();
				self.consumers.init_udp_autodiscover(self.$root.user);
				self.carregar_maquinas_interval = setInterval(function() {
					self.carregar_maquinas_conectadas();
				}, 10000);
			};
		} else { 
			console.log('não logado')
		}
	},

	beforeDestroy: function () {
		if (this.carregar_maquinas_interval) {
			clearInterval(this.carregar_maquinas_interval);
		}
	},

	data: function() {
		var self = this;
		var data = {
			logado: this.$root.is_logged(),
			testando: false,
			comprou: false,
			ja_configurou: false,
			prio_list: [],
			espec_list: [],
			box_list: [],
			box_medico_list: [],
			monitor_list: [],
			totem_list: [],
			carregar_maquinas_interval: null,
			consumers: require('electron').remote.require("./consumers"),
			index: require('electron').remote.require("./index"),
		};

		return data;
	},

	methods: {
		add_prioridade: function() {
			var self = this;
			this.$root.$router.push({name:"add-prioridade"});
		},

		delete_prioridade: function(prioridade) {
			var self = this;

			new daoclient.DaoPrioridade().delete(prioridade, this.$root.user.token)
			.done(function(data) {
				console.log("done");
				self.$root.mostrar_msg("Deletado");
				var index = self.prio_list.findIndex(function(obj){return obj == prioridade});
				self.prio_list.splice(index, 1);
			})
			.fail(function(data) {
				console.log(data.responseText);
				self.$root.mostrar_msg(data.responseText);
			});
		},

		add_especialidade: function() {
			var self = this;
			this.$root.$router.push({name:"add-especialidade"});
		},

		delete_especialidade: function(especialidade) {
			var self = this;

			new daoclient.Especialidade().delete(especialidade, this.$root.user.token)
			.done(function(data) {
				console.log("done");
				self.$root.mostrar_msg("Deletado");
				var index = self.espec_list.findIndex(function(obj){return obj == especialidade});
				self.espec_list.splice(index, 1);
			})
			.fail(function(data) {
				console.log(data.responseText);
				self.$root.mostrar_msg(data.responseText);
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
				self.$root.mostrar_msg("Deletado");
				var index = self.box_list.findIndex(function(obj){return obj == box});
				self.box_list.splice(index, 1);
			})
			.fail(function(data) {
				console.log(data.responseText);
				self.$root.mostrar_msg(data.responseText);
			});
		},

		add_box_medico: function() {
			var self = this;
			this.$root.$router.push({name:"add-box-medico"});
		},

		delete_box_medico: function(box_medico) {
			var self = this;

			new daoclient.DaoBoxMedico().delete(box_medico, this.$root.user.token)
			.done(function(data) {
				console.log("done");
				self.$root.mostrar_msg("Deletado");
				var index = self.box_medico_list.findIndex(function(obj){return obj == box_medico});
				self.box_medico_list.splice(index, 1);
			})
			.fail(function(data) {
				console.log(data.responseText);
				self.$root.mostrar_msg(data.responseText);
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
				self.$root.mostrar_msg("Deletado");
				var index = self.monitor_list.findIndex(function(obj){return obj == monitor});
				self.monitor_list.splice(index, 1);
			})
			.fail(function(data) {
				console.log(data.responseText);
				self.$root.mostrar_msg(data.responseText);
			});
		},

		add_totem: function() {
			var self = this;
			this.$root.$router.push({name:"add-totem"});
		},

		delete_totem: function(totem) {
			var self = this;
			new daoclient.DaoTotem().delete(totem, this.$root.user.token)
			.done(function(data) {
				console.log("done");
				self.$root.mostrar_msg("Deletado");
				var index = self.totem_list.findIndex(function(obj){return obj == totem});
				self.totem_list.splice(index, 1);
			})
			.fail(function(data) {
				console.log(data.responseText);
				self.$root.mostrar_msg(data.responseText);
			});
		},

		open_subsystem: function() {
			this.$root.$router.push({name: "subsystem"});
		},

		carregar_maquinas_conectadas: function() {
			var self = this;

			/**
				Incluir prioridades!
			*/
			new daoclient.DaoPrioridade().list(this.$root.user.token)
			.done(function(data) {
				// console.log("done list box");
				self.prio_list = [];
				for (var i = 0; i < data.length; i++) {
					self.prio_list.push(data[i]);
				}
				if (self.prio_list.length > 0) {
					self.consumers.sync_prioridade_with_web(self.prio_list);
				}
			})
			.fail(function(data) {
				console.log("Erro no list prioridade");
				console.log("Refreshing token...");
				self.$root.user.firebase.getIdToken().then(function(token) {
			    console.log("Token refreshed!");
			    app.user.token = token;
			  });
			});

			new daoclient.Especialidade().list(this.$root.user.token)
			.done(function(data) {
				// console.log("done list box");
				self.espec_list = [];
				for (var i = 0; i < data.length; i++) {
					self.espec_list.push(data[i]);
				}
				if (self.espec_list.length > 0) {
					self.consumers.sync_prioridade_with_web(self.espec_list);
				}
			})
			.fail(function(data) {
				console.log("Erro no list especialidade");
				console.log("Refreshing token...");
				self.$root.user.firebase.getIdToken().then(function(token) {
			    console.log("Token refreshed!");
			    app.user.token = token;
			  });
			});

			new daoclient.DaoBox().list(this.$root.user.token)
			.done(function(data) {
				// console.log("done list box");
				self.box_list = [];
				for (var i = 0; i < data.length; i++) {
					self.box_list.push(data[i]);
				}
				if (self.box_list.length > 0) {
					self.consumers.sync_box_with_web(self.box_list);
				}
			})
			.fail(function(data) {
				console.log("Erro no list box");
				console.log("Refreshing token...");
				self.$root.user.firebase.getIdToken().then(function(token) {
			    console.log("Token refreshed!");
			    app.user.token = token;
			  });
			});

			new daoclient.DaoMonitor().list(this.$root.user.token)
			.done(function(data) {
				// console.log("done list monitor");
				self.monitor_list = [];
				for (var i = 0; i < data.length; i++) {
					self.monitor_list.push(data[i]);
				}
				if (self.monitor_list.length > 0) {
					self.consumers.sync_monitor_with_web(self.monitor_list);
				}
			})
			.fail(function(data) {
				console.log("Erro no list monitor");
			});

			new daoclient.DaoTotem().list(this.$root.user.token)
			.done(function(data) {
				// console.log("done list totem");
				self.totem_list = [];
				for (var i = 0; i < data.length; i++) {
					self.totem_list.push(data[i]);
				}
				if (self.totem_list.length > 0) {
					self.consumers.sync_totem_with_web(self.totem_list);
				}
			})
			.fail(function(data) {
				console.log("Erro no list totem");
			});

			new daoclient.DaoBoxMedico().list(this.$root.user.token)
			.done(function(data) {
				// console.log("done list box_medico");
				self.box_medico_list = [];
				for (var i = 0; i < data.length; i++) {
					self.box_medico_list.push(data[i]);
				}
				// if (self.box_medico_list.length > 0) {
				// 	self.consumers.sync_box_medico_with_web(self.box_medico_list);
				// }
			})
			.fail(function(data) {
				console.log("Erro no list totem");
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
