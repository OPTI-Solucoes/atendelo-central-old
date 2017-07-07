Vue.component('add-totem', {
	template: $.readFile('templates/system/insert/totem/add_totem.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("add-totem: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("add-totem: mounted");
    },

    data: function() {
        var self = this;
    	var data = {
            totem: {
                fields: {
                    apelido: null,
                },
            },
		};

    	return data;
    },

	methods: {
        add_totem: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoTotem().insert(self.totem, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.totem = data[0];
                    self.$root.$router.push({name: "system-painel"});
                })
                .fail(function(data) {
                    console.log("Erro no insert totem");
                });
        },
	},

});