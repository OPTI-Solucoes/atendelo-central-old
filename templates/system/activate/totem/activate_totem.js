Vue.component('activate-totem', {
	template: $.readFile('templates/system/activate/totem/activate_totem.html'),

	props: {
		exemplo: {
			default: function() {},
		}
	},

	beforeMount: function() {
        var self = this;
        console.log("activate-totem: beforeMount");
        this.$root.has_logged();
    },

    mounted: function() {
        var self = this;
        window.mdc.autoInit(/* root */ document, () => {});
        console.log("activate-totem: mounted");
    },

    data: function() {
        var self = this;
        var data = {};
        data['chave'] = null;
        data['ip'] = self.$root.user.local_ip;
        data['tem_acesso'] = true;

        if (self.$root.user.firebase) data['email'] = self.$root.user.firebase.email;
        else data['email'] = null;

        return data;
    },

	methods: {
        check: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoTotem().check({ip:self.$root.user.local_ip, email:self.email}, this.$root.user.token)
                .done(function(data) {
                    console.log(data);
                    var ip_central = data[0].fields.ip;
                    console.log(ip_central);
                    var win = window.open("http://" + ip_central + ":8080/inovefila/#/totem", '_blank');
                    console.log(win);
                    win.focus();

                    console.log("done");
                })
                .fail(function(data) {
                    console.log(data.responseText);

                    if (data.responseText.indexOf("Totem") !== -1) {
                        self.$root.mostrar_msg("Esta máquina ainda não tem acesso ao Totem");
                        self.tem_acesso = false;
                        setTimeout(function() {
                            window.mdc.autoInit(/* root */ document, () => {});
                        }, 100);
                    } else {
                        self.$root.mostrar_msg(data.responseText);
                    }
                });
        },

        activate: function(event) {
            if (event) event.preventDefault();

            var self = this;
            new daoclient.DaoTotem().activate({ip:self.ip, email:self.email, chave:self.chave}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    self.$root.mostrar_msg("Totem ativado com sucesso!");
                    self.$root.$router.push({name: "activate-totem"});
                })
                .fail(function(data) {
                    console.log(data.responseText);
                    self.$root.mostrar_msg(data.responseText);
                });
        },
	},

});
