daoclient.DaoBox = function () {
    
    this.url = settings.contextPath + "api/box/";

    this.insert = function (box, token) {
        return $.post({
		    url: this.url + "insert/",
		    data: {
				apelido: box.fields.apelido,
		    },
		    contentType: "application/json",
		    dataType: 'json',
		    headers: {
			    "content-type": "application/x-www-form-urlencoded",
			    "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
			}
		});
    };

    this.delete = function (box, token) {
        return $.post({
            url: this.url + "delete/",
            data: {
                apelido: box.fields.apelido,
            },
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
            }
        });
    };

    this.get = function (token) {
		return $.post({
            url: this.url + "get/",
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    };

    this.list = function (token) {
        return $.post({
            url: this.url + "list/",
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    };

    this.activate = function (obj, token) {
        return $.post({
            url: this.url + "activate/",
            data: {
                email: obj.email,
                chave: obj.chave,
                ip: obj.ip,
            },
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
            }
        });
    };

    this.check = function (obj, token) {
        return $.post({
            url: this.url + "check/",
            data: {
                email: obj.email,
                ip: obj.ip,
            },
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