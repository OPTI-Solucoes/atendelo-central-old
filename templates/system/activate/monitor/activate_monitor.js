Vue.component('activate-monitor', {
	template: $.readFile('templates/system/activate/monitor/activate_monitor.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("activate-monitor: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("activate-monitor: mounted");
    },

    data: function() {
        var self = this;
    	var data = {
            email: self.$root.user.firebase.email,
            chave: null,
            ip: self.$root.user.local_ip,
		};

    	return data;
    },

	methods: {
        activate: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoMonitor().activate({ip:self.ip, email:self.email, chave:self.chave}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.$root.$router.push({name: "system-painel"});
                })
                .fail(function(data) {
                    console.log("Erro no activate monitor");
                });
        },
	},

});