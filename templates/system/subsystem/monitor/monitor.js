Vue.component('monitor', {
    template: $.readFile('templates/system/subsystem/monitor/monitor.html'),

    data: function() {
        var self = this;
        var data = {
            con_ws: null,
            youtube_show: false,
            tv_show: true,
            senhas: [],
            json_to_send: {
                header:{action: null},
                body:{},
            },
        };
        return data;
    },

    beforeMount: function() {
        var self = this;
        // this.con_ws = new WebSocket(settings.websocketPath+"monitor/");
        this.con_ws = io(settings.websocketPath+"monitor");
    },

    mounted: function() {
        console.log("monitor - mounted");
        window.mdc.autoInit(/* root */ document, () => {});
        init_ws_monitor(this);
    },

    methods: {
        get_view: function() {
            this.json_to_send.header.action = 'get_view';
            this.con_ws.emit(this.json_to_send.header.action, JSON.stringify(this.json_to_send));
        },

        nova_senha: function() {

        },

        tocar_som: function() {
            var self = this;
            var nova_senha = new Audio("audio/tone_1.mp3");
            nova_senha.volume = 1;
            nova_senha.onended = function() {
                setTimeout(function(){
                    self.unmute_audios();
                }, 1000);
            };
            nova_senha.play();
        },

        tocar_voz: function(msg) {
            var self = this;
            var msg = new SpeechSynthesisUtterance(msg);
            msg.lang = 'pt-BR';
            msg.onend = function() {
                self.tocar_som();  
            };
            window.speechSynthesis.speak(msg);
        },

        tocar: function(msg) {
            var self = this;
            self.mute_audios();
            setTimeout(function(){
                var nova_senha = new Audio("audio/tone_1.mp3");
                nova_senha.volume = 1;
                nova_senha.onended = function() {
                    self.tocar_voz(msg);
                };
                nova_senha.play();
            }, 1000);                
        },

        mute_audios: function() {
            if (this.tv_show) {$("#tv").prop('muted', true);}
            if (this.youtube_show) {$("#multimidia").mute();}
        },

        unmute_audios: function() {
            if (this.tv_show) {$("#tv").prop('muted', false);}
            if (this.youtube_show) {$("#multimidia").unMute();}                
        },

        piscar_senha: function() {
        // console.log("#senha_"+senha.numero);
        // $("#senha_"+senha.numero).fadeOut(500);
        },

        ativar_youtube: function() {
            this.youtube_show = true;
            this.tv_show = false;
        },

        ativar_tv: function() {
            this.youtube_show = false;
            this.tv_show = true;
        },
    },
});

var init_ws_monitor = function(comp) {
    comp.con_ws.on('connect', function () {
        console.log('Connected');
        comp.get_view();

        comp.senhas = [];
    });

    comp.con_ws.on('disconnect', function(){
        console.log('Disconnect');
    });

    comp.con_ws.on('get_view', function(data){
        console.log("get_view event");
        console.log(data);
        comp.senhas = data.body.senhas;
    });

    comp.con_ws.on('get_senha', function(data){
        console.log("get_senha event");
        console.log(data);
        last_senha = data.body.senha;
        comp.senhas.unshift(last_senha);
        if (comp.senhas.length > 3) {
            comp.senhas.pop();
        }
        comp.tocar(last_senha.paciente + ". Sala do " + last_senha.especialidade);
    });

    comp.con_ws.on('nenhuma_senha', function(data){
        console.log("nenhuma_senha event");
        console.log(data);
    });

    // comp.con_ws.onopen = function () {
    //     console.log('WebSocket Connected');
    //     comp.get_view();
    // };

    // comp.con_ws.onerror = function (error) {
    //     console.log('WebSocket Error');
    // };

    // comp.con_ws.onmessage = function (e) {
    //     var json = JSON.parse(e.data);
    //     console.log(json);
    //     if (json) {
    //         console.log(json.header.action);
    //         if (json.header.action == "get_view") {
    //             comp.senhas = json.body.senhas;

    //         } else if (json.header.action == "get_senha") {
    //             last_senha = json.body.senha[0];
    //             $("#senhas_container").fadeOut(500, function() {
    //                 comp.senhas.unshift(last_senha);
    //                 if (comp.senhas.length > 3) {
    //                     comp.senhas.pop();
    //                 }
    //                 $("#senhas_container").fadeIn(500, function() {
    //                     comp.tocar(last_senha.fields.paciente + ". Sala do " + last_senha.fields.especialidade);
    //                 });
    //             });

    //         } else if (json.header.action == "gerar_historico") {
    //             console.error("Gerar histórico de hoje!");
    //         }
    //     } else {
    //         console.error("Json nulo");
    //     }
    // };

    // Coloca automaticamente a TV em tela cheia quando abre a tela
    // var elem = document.getElementById("tv");
    // if (elem.requestFullscreen) {
    //     elem.requestFullscreen();
    // } else if (elem.mozRequestFullScreen) {
    //     elem.mozRequestFullScreen();
    // } else if (elem.webkitRequestFullscreen) {
    //     elem.webkitRequestFullscreen();
    // }

    /*
    Copyright 2017 Google Inc.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */

    'use strict';

    var videoElement = document.querySelector('video');
    var audioSelect = document.querySelector('select#audioSource');
    var videoSelect = document.querySelector('select#videoSource');

    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices).then(getStream).catch(handleError);

    audioSelect.onchange = getStream;
    videoSelect.onchange = getStream;

    function gotDevices(deviceInfos) {
        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label ||
                'microphone ' + (audioSelect.length + 1);
                audioSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'camera ' +
                (videoSelect.length + 1);
                videoSelect.appendChild(option);
            } else {
                // console.log('Found ome other kind of source/device: ', deviceInfo);
            }
        }
    }

    function getStream() {
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        var constraints = {
            audio: {
                optional: [{
                    sourceId: audioSelect.value
                }]
            },
            video: {
                optional: [{
                    sourceId: videoSelect.value
                }]
            }
        };

        navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).catch(handleError);
    }

    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        videoElement.srcObject = stream;
    }

    function handleError(error) {
        console.log('Error: ', error);
    }
};