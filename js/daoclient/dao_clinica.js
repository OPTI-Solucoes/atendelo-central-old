daoclient.DaoClinica = function () {
    
    this.url = settings.contextPath + "api/clinica/";

    this.insert = function (clinica, token) {
        return $.post({
		    url: this.url + "insert/",
		    data: {
				nome: clinica.nome,
				email: clinica.email,
				endereco: clinica.endereco,
				telefone: clinica.telefone,
				cnpj: clinica.cnpj
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
    }

    this.iniciar_periodo_teste = function (token) {
    	return $.post({
            url: this.url + "iniciar_periodo_teste/",
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    }

    this.configurar_central = function (token, ip_central) {
    	return $.post({
            url: this.url + "configurar_central/",
            data: {
				ip_central: ip_central,
		    },
            contentType: "application/json",
            dataType: 'json',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization":  'Bearer ' + token
              }
        });
    }

};