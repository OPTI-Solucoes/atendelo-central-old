// $(document).ready(function() {

Vue.component('inserir-usuario', {
	template: $.readFile('templates/usuario/inserir/inserir_usuario.html'),

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
        console.log("Usuario Inserir: mounted");
		
    },

    data: function() {
    	var rc_data = {
			nome: "",
			cnpj: "",
			endereco: "",
			telefone: "",
		};
    	return rc_data;
    },

	methods: {
		inserir_usuario: function(event) {
			if (event) event.preventDefault();
			var self = this;
			var usuario = {
				nome: self.nome,
				endereco: self.endereco,
				telefone: self.telefone,
				cnpj: self.cnpj,
				email: self.$root.user.firebase.email,
			}
			if (self.$root.user.token) {
				new daoclient.DaoClinica().insert(usuario, self.$root.user.token)
					.done(function(data) {
		                console.log("done");
		                console.log(data);
		                self.$root.user.model = data[0];
						self.$root.registrando_usuario = false;
					    self.$root.loading.user = false;
			            self.$root.$router.push({name: "home"});
		                self.$root.mostrar_msg("Usuário inserido!");
		            })
		            .fail(function(data) {
		                console.log("fail");
		                self.$root.mostrar_msg("Houve um problema ao tentar inserir!");
		            });
	        } else {
                self.$root.mostrar_msg("Esperando Token...");
                setTimeout(function() {
	                self.$root.mostrar_msg("Tente novamente!");
                }, 1000);
	        }
		}
	},

});
