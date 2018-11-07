daoclient.DaoTipoAtendimento = function () {
    
    this.url = settings.contextPath + "api/tipo_atendimento/";

    this.insert = function (tipo_atendimento, token) {
        return $.post({
		    url: this.url + "insert/",
		    data: {
				nome: tipo_atendimento.fields.nome,
				cor: tipo_atendimento.fields.cor
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

    this.delete = function (tipo_atendimento, token) {
        return $.post({
            url: this.url + "delete/",
            data: {
                nome: tipo_atendimento.fields.nome,
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