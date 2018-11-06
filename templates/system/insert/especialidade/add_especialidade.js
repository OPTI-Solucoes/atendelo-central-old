Vue.component('add-especialidade', {
	template: $.readFile('templates/system/insert/especialidade/add_especialidade.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("add-especialidade: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("add-especialidade: mounted");
        
        const textFieldNome = new mdc.textField.MDCTextField(document.getElementById('nome-text-field'));
        const textFieldIniciais = new mdc.textField.MDCTextField(document.getElementById('iniciais-text-field'));
        const textFieldcor = new mdc.textField.MDCTextField(document.getElementById('cor-text-field'));
    },

    data: function() {
        var self = this;
    	var data = {
            especialidade: {
                fields: {
                    nome: null,
                    abrev: null,
                    cor: null,
                },
            },
		};

    	return data;
    },

    watch: {
        especialidade: function(newVal){
            console.log(newVal);
        }
    },

	methods: {
        add_especialidade: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.Especialidade().insert(self.especialidade, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.especialidade = data[0];
                    self.$root.$router.push({name: "home"});
                })
                .fail(function(data) {
                    console.log("Erro no insert especialidade");
                });
        },
	},

});