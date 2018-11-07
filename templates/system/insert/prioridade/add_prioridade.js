Vue.component('add-prioridade', {
    template: $.readFile('templates/system/insert/prioridade/add_prioridade.html'),
    
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
        console.log("add-prioridade: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("add-prioridade: mounted");
        
        const textFieldNome = new mdc.textField.MDCTextField(document.getElementById('nome-text-field'));
        const textFieldIniciais = new mdc.textField.MDCTextField(document.getElementById('iniciais-text-field'));
    },

    data: function() {
        var self = this;
    	var data = {
            prioridade: {
                fields: {
                    nome: null,
                    abrev: null,
                    cor: '#333333',
                },
            },
		};

    	return data;
    },

    watch: {
        prioridade: function(newVal){
            console.log(newVal);
        }
    },

	methods: {
        updateValue: function(val) {
            this.prioridade.fields.cor = val.hex;
        },
        add_prioridade: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoPrioridade().insert(self.prioridade, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.prioridade = data[0];
                    self.$root.$router.push({name: "home"});
                })
                .fail(function(data) {
                    console.log("Erro no insert prioridade");
                });
        },
	},

});