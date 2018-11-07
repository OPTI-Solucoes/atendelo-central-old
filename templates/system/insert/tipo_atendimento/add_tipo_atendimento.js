Vue.component('add-tipo-atendimento', {
    template: $.readFile('templates/system/insert/tipo_atendimento/add_tipo_atendimento.html'),
    
    components: {
      'slider-picker': VueColor.Slider
    },

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("add-tipo-atendimento: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("add-tipo-atendimento: mounted");
        
        const textFieldNome = new mdc.textField.MDCTextField(document.getElementById('nome-text-field'));
    },

    data: function() {
        var self = this;
    	var data = {
            tipoAtendimento: {
                fields: {
                    nome: null,
                    cor: '#FFFFFF',
                },
            }
		};

    	return data;
    },

    watch: {
        tipoAtendimento: function(newVal){
            console.log(newVal);
        }
    },

	methods: {
        updateValue: function(val) {
            this.tipoAtendimento.fields.cor = val.hex;
        },
        add_tipo_atendimento: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoTipoAtendimento().insert(self.tipoAtendimento, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.tipoAtendimento = data[0];
                    self.$root.$router.push({name: "home"});
                })
                .fail(function(data) {
                    console.log("Erro no insert tipo de atendimento");
                });
        },
	},

});