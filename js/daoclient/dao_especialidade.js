daoclient.Especialidade = function () {
    
    this.url = settings.localContextPath + "api/especialidade/";

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