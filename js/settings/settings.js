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

    settings.websocketPath = null;
    // settings.localContextPath = null;

    setTimeout(function() {
        console.error("MUDAR O IP PARA RODAR NO SERVIDOR - DEBUG = false");
    }, 10);

} else {
    settings.contextPath = "https://inovefila.atendelo.com/";

    settings.websocketPath = null;
    // settings.localContextPath = null;
}
