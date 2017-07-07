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
        console.log("home - mounted");
    },

    methods: {
        abrirBox: function() {
            var self = this;
            new daoclient.DaoBox().check({ip:self.$root.user.local_ip, email:self.$root.user.firebase.email}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
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

        abrirMonitor: function() {
            var self = this;
            new daoclient.DaoMonitor().check({ip:self.$root.user.local_ip, email:self.$root.user.firebase.email}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
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

        abrirTotem: function() {
            var self = this;
            new daoclient.DaoTotem().check({ip:self.$root.user.local_ip, email:self.$root.user.firebase.email}, this.$root.user.token)
                .done(function(data) {
                    console.log("done");
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
    },
});