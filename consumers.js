function get_senha(incoming_json, sockets) {
	// body...
	today_date = new Date(); today_date.setHours(0,0,0,0);
	verify_today_historico();
	verify_today_filas();

	filas_list = ['MED', 'PRE', 'NOR'];

	ws_response_to_monitores = new WsResponse("get_senha");
	ws_response_to_box = new WsResponse("proxima_senha");

	senha_enviada_pk = incoming_json.body.senha.pk;
	senha_enviada_tempo_decorrido = incoming_json.body.senha.tempo_decorrido;
	ultima_fila_usada = incoming_json.body.fila.iniciais;
	fila_manual = incoming_json.body.fila_manual.iniciais;

	// Para os monitores
	if (senha_enviada_pk) {
		db.collection("senha").findOne({id: senha_enviada_pk} function(err, result) {
			if (err) {throw err;}
			senha_enviada = result;
			senha_enviada.atendida = true;
			db.collection("senha").updateOne({id: result.id}, senha_enviada, function(err, res) {
				if (err) {throw err;}
				console.log("Senha updated");
				console.log(res);
				ws_response_to_monitores.body['senha'] = res;
			});
		});
	} else {
		ws_response_to_monitores.body['senha'] = null;
	}

	if (fila_manual) {
		db.collection("senha").findOne({fila: fila_manual} function(err, result) {
			if (err) {throw err;}
			if (result) {
				proxima_senha = result;
				ws_response_to_box.body['senha'] = proxima_senha;
			} else {
				ws_response_to_box.header.action = "nenhuma_senha";
			}
		});

	} else {
		if (ultima_fila_usada) {
			switch(ultima_fila_usada) {
				case "MED":
					fila = "PRE";
					break;
				case "PRE":
					fila = "NOR";
					break;
				case "NOR":
					fila = "MED";
					break;
				default:
					fila = "MED";
			}
		} else {
			fila = "MED";
		}

		db.collection("senha").find({fila: fila, atendida: false}).toArray(function(err, res) {
			if (err) {throw err};
			if (res.length > 0){
				ws_response_to_box.header.action = "proxima_senha";
				for (var i = 0; i < res.length; i++) {
					proxima_senha = res[i];
					if (res[i].fila == fila) {
						break;
					}
				}
			} else {
				ws_response_to_box.header.action = "nenhuma_senha";
			}
		});
	}

	sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
	sockets.box.emit(ws_response_to_box.header.action, ws_response_to_box);
}

function get_view() {
	today_date = new Date(); today_date.setHours(0,0,0,0);
	verify_today_historico();
	verify_today_filas();

	ws_response_to_monitores = new WsResponse("get_view");

	senhas = [];

	db.collection("senha").find({fila: 'MED', atendida: true}).toArray(function(err, res) {
			if (err) {throw err};
			if (res.length > 0) {
				senhas.push(res[res.length-1]);
			}
		});

	db.collection("senha").find({fila: 'PRE', atendida: true}).toArray(function(err, res) {
			if (err) {throw err};
			if (res.length > 0) {
				senhas.push(res[res.length-1]);
			}
		});

	db.collection("senha").find({fila: 'NOR', atendida: true}).toArray(function(err, res) {
			if (err) {throw err};
			if (res.length > 0) {
				senhas.push(res[res.length-1]);
			}
		});

	if (senhas.length > 0) {
		ws_response_to_monitores.header.action = "get_view";
		ws_response_to_monitores.body["senhas"] = senhas;
	} else {
		ws_response_to_monitores.header.action = "nenhuma_senha";
	}

	sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
}

function verify_today_historico() {
	db.collection("historico").find({data: today_date}).toArray(function(err, result) {
		if (err) {throw err;}
		if (result.length == 0) {
			historico = {data: today_date, quant_atendimentos: 0, tempo_medio_atendimento: null};
			db.collection("historico").insertOne(historico, function(err, res) {
				if (err) {throw err;}
				console.log("1 Record Inserted, HISTORICO");
			});
		}
	});
}

function verify_today_filas() {
	db.collection("fila").find({data: today_date}).toArray(function(err, result) {
		if (err) {throw err;}
		if (result.length == 0) {
			filas = [
				{classificacao: "Medico", iniciais: "MED", data: today_date},
				{classificacao: "Preferencial", iniciais: "PRE", data: today_date},
				{classificacao: "Normal", iniciais: "NOR", data: today_date},
			];

			db.collection("fila").insertMany(filas, function(err, res) {
				if (err) {throw err;}
				console.log(res.insertedCount+ " Record(s) Inserted(s), FILA");
			});
		}
	});
}

function WsResponse(action) {
	this.header = {action: action};
	this.body = {};
}