daoclient.Especialidade = function () {
    
	this.url = settings.contextPath + "api/especialidade/";
	
	this.insert = function (especialidade, token) {
        return $.post({
		    url: this.url + "insert/",
		    data: {
				nome: especialidade.fields.nome,
				cor: especialidade.fields.cor,
                abrev: especialidade.fields.abrev
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

    this.delete = function (especialidade, token) {
        return $.post({
            url: this.url + "delete/",
            data: {
                nome: especialidade.fields.nome,
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

	this.select_all = function () {
        return $.post({
		    url: this.url + "select_all/",
		    data: {
		    },
		    contentType: "application/json",
		    dataType: 'json',
		    headers: {
			    "content-type": "application/x-www-form-urlencoded",
			    "cache-control": "no-cache",
			}
		});

	};

};