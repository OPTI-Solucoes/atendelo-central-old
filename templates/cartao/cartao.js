// $(document).ready(function() {

Vue.component('cartao', {
	template: $.readFile('templates/cartao/cartao.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("Cartao: mounted");
		
    },

    data: function() {
    	var self = this;
    	var rc_data = {
			logado: true,
		};
    	return rc_data;
    },

	methods: {
		gerar: function(event) {
			if (event) event.preventDefault();
			var self = this;
			var usuario = Static.USER;
            self.$root.mostrar_msg("Gerando cartão...");
			new daoclient.DaoCartao().insert(usuario)
				.done(function(data) {
	                console.log("done");
	                // alert("Usuário inserido!");
					self.$root.gerar_cartao();
	            })
	            .fail(function(data) {
	                console.log("fail");
	                self.$root.mostrar_msg("Houve um problema ao tentar gerar o seu cartão!");
	            });
		}
	},

});
