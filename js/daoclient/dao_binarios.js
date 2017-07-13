daoclient.DaoBinarios = function () {
    
    this.url = settings.contextPath + "api/binarios/";

    this.get_windows = function (token) {
		return $.post({
            url: this.url + "get_windows/",
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    };

    this.get_linux_32 = function (token) {
        return $.post({
            url: this.url + "get_linux_32/",
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    };

    this.get_linux_64 = function (token) {
        return $.post({
            url: this.url + "get_linux_64/",
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    };

};