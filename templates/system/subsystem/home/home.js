Vue.component('subsystem', {
    template: $.readFile('templates/system/subsystem/home/home.html'),

    data: function() {
        var self = this;
        var data = {};
        return data;
    },

    beforeMount: function() {
        var self = this;
    },

    mounted: function() {
        console.log("home_subsystem - mounted");
    },

    methods: {
        abrirBox: function() {
            var self = this;
            new daoclient.DaoBox().check({ip:self.$root.user.local_ip, email:self.$root.user.firebase.email}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    // var ip_central = data[0].fields.ip;
                    // var win = window.open("http://" + ip_central + ":8080/inovefila/#/totem", '_blank');
                    // win.focus();
                    self.$root.$router.push({name: "box"});
                })
                .fail(function(data) {
                    console.log(data.responseText);
                    self.$root.mostrar_msg(data.responseText);
                });
        },

        ativarBox: function() {
            this.$root.$router.push({name: "activate-box"});
        },

        baixarBox: function() {
            console.log("Baixar software do Box");
        },

        abrirMonitor: function() {
            var self = this;
            new daoclient.DaoMonitor().check({ip:self.$root.user.local_ip, email:self.$root.user.firebase.email}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    // var ip_central = data[0].fields.ip;
                    // var win = window.open("http://" + ip_central + ":8080/inovefila/#/totem", '_blank');
                    // win.focus();
                    self.$root.$router.push({name: "monitor"});
                })
                .fail(function(data) {
                    console.log(data.responseText);
                    self.$root.mostrar_msg(data.responseText);
                });
        },

        ativarMonitor: function() {
            this.$root.$router.push({name: "activate-monitor"});
        },

        baixarMonitor: function() {
            console.log("Baixar software do Monitor");
        },

        abrirTotem: function() {
            var self = this;
            new daoclient.DaoTotem().check({ip:self.$root.user.local_ip, email:self.$root.user.firebase.email}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
                    // var ip_central = data[0].fields.ip;
                    // var win = window.open("http://" + ip_central + ":8080/inovefila/#/totem", '_blank');
                    // win.focus();
                    self.$root.$router.push({name: "totem"});
                })
                .fail(function(data) {
                    console.log(data.responseText);
                    self.$root.mostrar_msg(data.responseText);
                });
        },

        ativarTotem: function() {
            this.$root.$router.push({name: "activate-totem"});
        },

        baixarTotem: function() {
            console.log("Baixar software do Totem");
        },
    },
});
