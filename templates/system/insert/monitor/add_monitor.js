Vue.component('add-monitor', {
	template: $.readFile('templates/system/insert/monitor/add_monitor.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
		var self = this;
		console.log("add-monitor: beforeMount");
		this.$root.has_logged();
	},

	mounted: function() {
		var self = this;
		window.mdc.autoInit(/* root */ document, () => {});
		console.log("add-monitor: mounted");
	},

	data: function() {
		var self = this;
		var data = {
			monitor: {
				fields: {
					apelido: null,
				},
			},
		};

		return data;
	},

	methods: {
		add_monitor: function(event) {
			if (event) event.preventDefault();
			var self = this;
			new daoclient.DaoMonitor().insert(self.monitor, this.$root.user.token)
			.done(function(data) {
				console.log("done");
				self.monitor = data[0];
				self.$root.$router.push({name: "system-painel"});
			})
			.fail(function(data) {
				console.log(data);
				console.log("Erro no insert monitor");
			});
		},
	},

});
