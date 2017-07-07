Vue.component('home', {
	template: $.readFile('templates/home/home.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("Home: beforeMount");
        // this.$root.has_logged(function() {
        //     self.$root.loading.page = true;
        // });
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("Home: mounted");
    },

    data: function() {
        var self = this;
    	var rc_data = {
			nome: "Cartão do Reability Center",
            logado: false,
            // logado: !self.$root.loading.user,
		};
    	return rc_data;
    },

	methods: {

	},

});