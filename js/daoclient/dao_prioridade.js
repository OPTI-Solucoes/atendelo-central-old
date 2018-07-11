daoclient.DaoPrioridade = function () {
    
    this.url = settings.contextPath + "api/prioridade/";

    this.insert = function (prioridade, token) {
        return $.post({
		    url: this.url + "insert/",
		    data: {
				nome: prioridade.fields.nome,
				cor: prioridade.fields.cor,
                abrev: prioridade.fields.abrev
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

    this.delete = function (prioridade, token) {
        return $.post({
            url: this.url + "delete/",
            data: {
                nome: prioridade.fields.nome,
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

};