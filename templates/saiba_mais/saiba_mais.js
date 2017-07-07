Vue.component('saiba-mais', {
	template: $.readFile('templates/saiba_mais/saiba_mais.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("Home: beforeMount");
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("Saiba-mais: mounted");
    },

    data: function() {
        var self = this;
    	var rc_data = {};
    	return rc_data;
    },

	methods: {

	},

});