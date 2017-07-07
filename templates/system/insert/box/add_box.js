Vue.component('add-box', {
	template: $.readFile('templates/system/insert/box/add_box.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("add-box: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("add-box: mounted");
    },

    data: function() {
        var self = this;
    	var data = {
            box: {
                fields: {
                    apelido: null,
                },
            },
		};

    	return data;
    },

	methods: {
        add_box: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoBox().insert(self.box, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.box = data[0];
                    self.$root.$router.push({name: "system-painel"});
                })
                .fail(function(data) {
                    console.log("Erro no insert box");
                });
        },
	},

});