var ObjectId = require('mongodb').ObjectID;

exports.atender_senha = function(incoming_json_, sockets, db) {
	console.log("atender_senha");
	incoming_json = JSON.parse(incoming_json_);
	console.log(incoming_json);

	ws_response_to_monitores = new WsResponse("get_senha");
	ws_response_to_box_sala = new WsResponse("atender_senha");

	senha_enviada_tempo_decorrido = incoming_json.body.senha.tempo_decorrido;

	db.collection("senha").findOne({_id: new ObjectId(incoming_json.body.senha._id)}, function(err, result) {
		if (err) {throw err;}
		console.log(result);
		if (result) {
			var senha_enviada = result;
			senha_enviada.atendida_sala = true;
			db.collection("senha").updateOne({_id: new ObjectId(senha_enviada._id)}, senha_enviada, function(err, res) {
				if (err) {throw err;}
				console.log("Senha updated");
				ws_response_to_monitores.body['senha'] = senha_enviada;
				ws_response_to_box_sala.body['senha'] = senha_enviada;

				sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
				sockets.box_sala.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
			});
		}
	});

}

exports.get_senha = function(incoming_json_, sockets, db) {
	console.log("get_senha");
	incoming_json = JSON.parse(incoming_json_);
	console.log(incoming_json);

	ws_response_to_monitores = new WsResponse("get_senha");
	ws_response_to_box = new WsResponse("proxima_senha");
	ws_response_to_box_sala = new WsResponse("nova_senha");

	senha_enviada_tempo_decorrido = incoming_json.body.senha.tempo_decorrido;
	ultima_fila_usada = incoming_json.body.fila.iniciais;
	fila_manual = incoming_json.body.fila_manual.iniciais;

	db.collection("senha").findOne({_id: new ObjectId(incoming_json.body.senha._id)}, function(err, result) {
		if (err) {throw err;}
		console.log(result);
		if (result) {
			var senha_enviada = result;
			senha_enviada.atendida = true;
			db.collection("senha").updateOne({_id: new ObjectId(senha_enviada._id)}, senha_enviada, function(err, res) {
				if (err) {throw err;}
				console.log("Senha updated");
				ws_response_to_monitores.body['senha'] = senha_enviada;
				ws_response_to_box_sala.body['senha'] = senha_enviada;

				if (fila_manual) {
					db.collection("senha").findOne({fila: fila_manual, atendida: false}, function(err, result) {
						if (err) {throw err;}
						if (result) {
							proxima_senha = result;
							ws_response_to_box.body['senha'] = proxima_senha;
						} else {
							ws_response_to_box.header.action = "nenhuma_senha";
						}

						sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
						sockets.box.emit(ws_response_to_box.header.action, ws_response_to_box);
						sockets.box_sala.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
					});

				} else {
					db.collection("senha").find({atendida: false}).toArray(function(err, res) {
						if (err) {throw err};
						console.log(res.length);
						if (res.length > 0){
							ws_response_to_box.header.action = "proxima_senha";
							escolher = true;
							for (var i = 0; i < res.length; i++) {
								if (res[i].fila == "PRE") {
									proxima_senha = res[i];
									break;
								} else {
									if (escolher) {
										proxima_senha = res[i];
										escolher = false;
									}
								}
							}
							ws_response_to_box.body['senha'] = proxima_senha;
						} else {
							ws_response_to_box.header.action = "nenhuma_senha";
						}
						sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
						sockets.box.emit(ws_response_to_box.header.action, ws_response_to_box);
						sockets.box_sala.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
					});
				}
			});
		} else {
			console.log("NENHUMA SENHA ENVIADA");

			if (fila_manual) {
				console.log("FILA_MANUAL");
				console.log(fila_manual);
				db.collection("senha").findOne({fila: fila_manual, atendida: false}, function(err, result) {
					if (err) {throw err;}
					if (result) {
						proxima_senha = result;
						ws_response_to_box.body['senha'] = proxima_senha;
					} else {
						ws_response_to_box.header.action = "nenhuma_senha";
					}
					sockets.box.emit(ws_response_to_box.header.action, ws_response_to_box);
				});

			} else {
				console.log("FILA_AUTOMATICA");
				db.collection("senha").find({atendida: false}).toArray(function(err, res) {
					if (err) {throw err};
					console.log(res.length);
					if (res.length > 0){
						ws_response_to_box.header.action = "proxima_senha";
						escolher = true;
						for (var i = 0; i < res.length; i++) {
							if (res[i].fila == "PRE") {
								proxima_senha = res[i];
								break;
							} else {
								if (escolher) {
									proxima_senha = res[i];
									escolher = false;
								}
							}
						}
						ws_response_to_box.body['senha'] = proxima_senha;
					} else {
						ws_response_to_box.header.action = "nenhuma_senha";
					}
					sockets.box.emit(ws_response_to_box.header.action, ws_response_to_box);
				});
			}
		}
	});
}

exports.get_view = function(incoming_json_, sockets, db) {
	console.log("get_view");
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_monitores = new WsResponse("get_view");

	senhas = [];

	db.collection("senha").find({fila: 'PRE', atendida: true}).toArray(function(err, res) {
		if (err) {throw err};
		if (res.length > 0) {
			senhas.push(res[res.length-1]);
		}

		db.collection("senha").find({fila: 'NOR', atendida: true}).toArray(function(err, res) {
			if (err) {throw err};
			if (res.length > 0) {
				senhas.push(res[res.length-1]);
			}

			if (senhas.length > 0) {
				ws_response_to_monitores.header.action = "get_view";
				ws_response_to_monitores.body["senhas"] = senhas;
			} else {
				ws_response_to_monitores.header.action = "nenhuma_senha";
			}

			sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
		});
	});
}

exports.insert_senha = function(incoming_json_, sockets, db) {
	console.log("insert_senha");
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_boxes = new WsResponse("nova_senha_em_espera");
	ws_response_to_totens = new WsResponse("solicitar_nova_senha");

	db.collection("senha").find({}).toArray(function(err, res) {
		if (err) {throw err};
		var prox_num = 0;

		if (res.length > 0) {
			console.log(res);
			prox_num = res[res.length-1].numero+1;
		}

		senha = {
			numero: prox_num,
			paciente: incoming_json.body.paciente,
			especialidade: incoming_json.body.especialidade,
			fila: incoming_json.body.fila,
			atendida: false,
			atendida_sala: false,
		};

		db.collection("senha").insertOne(senha, function(err, res) {
			if (err) {throw err};
			console.log("Senha inserted: ");
			senha = res.ops[0];

			ws_response_to_totens.body['senha'] = senha;

			sockets.box.emit(ws_response_to_boxes.header.action, ws_response_to_boxes);
			sockets.totem.emit(ws_response_to_totens.header.action, ws_response_to_totens);
		});
	});
}

exports.verify_today_historico = function (db, today_date) {
	db.collection("historico").find({data: today_date}).toArray(function(err, result) {
		if (err) {throw err;}
		if (result.length == 0) {
			historico = {data: today_date, quant_atendimentos: 0, tempo_medio_atendimento: null};
			db.collection("historico").insertOne(historico, function(err, res) {
				if (err) {throw err;}
				console.log("1 Record Inserted, HISTORICO");
				verify_today_filas(db, today_date);
			});
		} else {
			verify_today_filas(db, today_date);
		}
	});
}

function verify_today_filas(db, today_date) {
	db.collection("fila").find({data: today_date}).toArray(function(err, result) {
		if (err) {throw err;}
		if (result.length == 0) {
			filas = [
				// {classificacao: "Medico", iniciais: "MED", data: today_date},
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
