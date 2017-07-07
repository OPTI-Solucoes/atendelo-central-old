daoclient.Paciente = function () {
    
    this.url = settings.localContextPath + "api/paciente/";

    this.insert_or_update = function (paciente) {
        return $.post({
		    url: this.url + "insert_or_update/",
		    data: {
		    	nome: paciente.nome,
		    	cpf: paciente.cpf,
		    	numero_senha: paciente.senha,
		    	especialidade: paciente.especialidade
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