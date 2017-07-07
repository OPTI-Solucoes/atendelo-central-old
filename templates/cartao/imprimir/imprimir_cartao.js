// $(document).ready(function() {

Vue.component('imprimir-cartao', {
	template: $.readFile('templates/cartao/imprimir/imprimir_cartao.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        self.carregar_cartao();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("ImprimirCartao: mounted");
    },

    data: function() {
    	var rc_data = {
			cartao: null,
			logado: true,
			carregando_impressao: true,
			erro_cartao: false,
		};
    	return rc_data;
    },

	methods: {
		carregar_cartao: function(event) {
			if (event) event.preventDefault();
			var self = this;
			var usuario = Static.USER;
			self.carregando_impressao = true;
			new daoclient.DaoCartao().get(usuario.firebase.token)
				.done(function(data) {
	                console.log("done");
	                self.cartao = data[0];
					self.$root.gerar_cartao();
					self.carregando_impressao = false;
	                self.$root.mostrar_msg("Você já pode imprimir seu cartão!");
	            })
	            .fail(function(data) {
	                console.log("fail");
	                self.erro_cartao = true;
	                self.$root.mostrar_msg("Tente novamente mais tarde");
	            });
		},

		fechar_impressao: function(event) {
			if (event) event.preventDefault();
			var self = this;
			self.$root.$router.push({name: "home"});
		},

		imprimir: function(event) {
			window.print();
		}
	},

});
