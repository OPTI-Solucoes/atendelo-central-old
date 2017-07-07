var settings = {
    DEBUG: false,
};

var daoclient = {};

$.readFile = function(url) {
	var txt = undefined;
	$.ajax({ 
        url: url,
        async: false,
        success: function (data) {
            txt = data; 
        }
    });
    return txt;
};

if (settings.DEBUG) {
    settings.contextPath = "http://localhost:8080/inovefila/"
    
    // Colocar o WS para o server local
    // settings.websocketPath = "http://localhost:3000/";
    settings.localContextPath = "http://localhost:8080/reabilitycenter/";

    settings.websocketPath = null;
    // settings.localContextPath = null;

    setTimeout(function() {
        console.error("MUDAR O IP PARA RODAR NO SERVIDOR - DEBUG = false");
    }, 10);

} else {
    settings.contextPath = "https://inovefila.opti-apps.com/";

    // Colocar o WS para o server local
    // settings.websocketPath = "wss://reability.opti-apps.com/";
    settings.localContextPath = "https://reability.opti-apps.com/";

    settings.websocketPath = null;
    // settings.localContextPath = null;
}