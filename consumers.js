var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db = null;
var dgram = require('dgram');
var server_broadcast = null;

exports.connect_to_database = function() {
	var url_db = "mongodb://localhost:27017/localdb";

	mongo.connect(url_db, function(err, db_){
	  if (err) {throw err;}
	  console.log("Connected to the Database...");

	  db = db_;

	  db.createCollection("historico", function(err, res){
	    if (err) {console.log(err);}
	    else {console.log("Table can be writted...");}

	    verificar(db);
	    setInterval(function() {
	      verificar(db);
	    }, 10000);
	  });
	});
}

function verificar(db) {
  console.log("Verificando...");
  today_date = new Date();
  today_date.setHours(0,0,0,0);
  verify_today_historico(db, today_date);
}

// Nova função dee atender senhas para o Box
exports.atender_senha_box = function(incoming_json_, sockets, client) {
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_box = new WsResponse("atendeu_senha");
	ws_response_to_box_sala = new WsResponse("nova_senha");

	db.collection("senha").findOne({_id: new ObjectId(incoming_json.body.senha._id)}, function(err, result) {
		if (err) {throw err;}
		console.log(result);
		if (result) {
			var senha_enviada = result;
			senha_enviada.atendida = true;
			senha_enviada.fila_sala = incoming_json.body.senha.fila_sala;
			senha_enviada.box = incoming_json.body.box.apelido;
			senha_enviada.em_atendimento_box = false;
			if (senha_enviada.fila_sala == "nao_encaminhar") {
				senha_enviada.finalizada = new Date();
			}
			db.collection("senha").updateOne({_id: new ObjectId(senha_enviada._id)}, senha_enviada, function(err, res) {
				if (err) {throw err;}
				console.log("Senha updated");
				ws_response_to_box.body["atendeu_senha"] = true;
				ws_response_to_box_sala.body["senha"] = senha_enviada;
				client.emit(ws_response_to_box.header.action, ws_response_to_box);
				sockets.box_sala.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
			});
		} else {
			ws_response_to_box.body["atendeu_senha"] = false;
			client.emit(ws_response_to_box.header.action, ws_response_to_box);
		}
	});
}

// Nova função para desistir da senha para o Box
exports.desistir_atender_senha = function(incoming_json_, sockets) {
	incoming_json = JSON.parse(incoming_json_);

	db.collection("senha").findOne({_id: new ObjectId(incoming_json.body.senha._id)}, function(err, result) {
		if (err) {throw err;}
		console.log(result);
		var senha_enviada = result;
		senha_enviada.desistiu = true;
		senha_enviada.atendida = true;
		senha_enviada.em_atendimento_box = false;
		db.collection("senha").updateOne({_id: new ObjectId(senha_enviada._id)}, senha_enviada, function(err, res) {
			if (err) {throw err;}
			console.log("Senha updated");
		});
	});
}

exports.atender_senha_sala = function(incoming_json_, sockets, client) {
	console.log("atender_senha_sala");
	incoming_json = JSON.parse(incoming_json_);
	console.log(incoming_json);

	ws_response_to_monitores = new WsResponse("get_senha");
	ws_response_to_box_sala_all = new WsResponse("atualizar_senhas");

	db.collection("senha").findOne({_id: new ObjectId(incoming_json.body.senha._id)}, function(err, result) {
		if (err) {throw err;}
		console.log(result);
		if (result) {
			var senha_enviada = result;
			senha_enviada.atendida_sala = true;
			senha_enviada.finalizada = new Date();
			db.collection("senha").updateOne({_id: new ObjectId(senha_enviada._id)}, senha_enviada, function(err, res) {
				if (err) {throw err;}
				console.log("Senha updated");
				ws_response_to_monitores.body['senha'] = senha_enviada;
				ws_response_to_box_sala_all.body['senha'] = senha_enviada;

				sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
				sockets.box_sala.emit(ws_response_to_box_sala_all.header.action, ws_response_to_box_sala_all);
			});
		}
	});
}

// Nova função para desistir da senha para a Sala
exports.desistir_atender_senha_sala = function(incoming_json_, sockets) {
	incoming_json = JSON.parse(incoming_json_);
	ws_response_to_box_sala = new WsResponse("atualizar_senhas");

	db.collection("senha").findOne({_id: new ObjectId(incoming_json.body.senha._id)}, function(err, result) {
		if (err) {throw err;}
		console.log(result);
		var senha_enviada = result;
		senha_enviada.desistiu = true;
		senha_enviada.atendida_sala = true;
		db.collection("senha").updateOne({_id: new ObjectId(senha_enviada._id)}, senha_enviada, function(err, res) {
			if (err) {throw err;}
			console.log("Senha updated");
			ws_response_to_box_sala.body['senha'] = senha_enviada;
			sockets.box_sala.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
		});
	});
}

// Nova função de pedir próxia senha para o Box
exports.get_proxima_senha = function(incoming_json_, sockets, client) {
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_monitores = new WsResponse("get_senha");
	ws_response_to_box = new WsResponse("get_proxima_senha");

	fila_manual = incoming_json.body.fila_manual;
	tipo_atendimento = incoming_json.body.tipo_atendimento;

	if (fila_manual) {
		var obj = {
			fila: fila_manual,
			atendida: false,
			desistiu: false,
			em_atendimento_box: false
		};

		console.log(tipo_atendimento);

		if (tipo_atendimento) {
			console.log("entrou");
			obj["tipo_atendimento"] = tipo_atendimento;
		}

		console.log(obj);

		db.collection("senha").findOne(obj, function(err, result) {
			if (err) {throw err;}
			if (result) {
				proxima_senha = result;
				proxima_senha.em_atendimento_box = true;
				proxima_senha.box = incoming_json.body.box.apelido;
				db.collection("senha").updateOne({_id: new ObjectId(proxima_senha._id)}, proxima_senha, function(err, res) {
					if (err) {throw err;}
					ws_response_to_box.body['senha'] = proxima_senha;
					ws_response_to_monitores.body['senha'] = proxima_senha;
					client.emit(ws_response_to_box.header.action, ws_response_to_box);
					sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
				});
			} else {
				ws_response_to_box.header.action = "nenhuma_senha";
				client.emit(ws_response_to_box.header.action, ws_response_to_box);
			}
		});
	} else {
		var obj = {
			atendida: false,
			desistiu: false,
			em_atendimento_box: false
		};

		if (tipo_atendimento) {
			obj["tipo_atendimento"] = tipo_atendimento;
		}

		db.collection("senha").find(obj).toArray(function(err, res) {
			if (err) {throw err};
			console.log(res.length);
			if (res.length > 0){
				escolher = true;
				proxima_senha = null;
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

				proxima_senha.em_atendimento_box = true;
				proxima_senha.box = incoming_json.body.box.apelido;
				db.collection("senha").updateOne({_id: new ObjectId(proxima_senha._id)}, proxima_senha, function(err, res) {
					ws_response_to_box.body['senha'] = proxima_senha;
					ws_response_to_monitores.body['senha'] = proxima_senha;
					client.emit(ws_response_to_box.header.action, ws_response_to_box);
					sockets.monitor.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
				});
			} else {
				ws_response_to_box.header.action = "nenhuma_senha";
				client.emit(ws_response_to_box.header.action, ws_response_to_box);
			}
		});
	}
}

exports.get_view = function(incoming_json_, sockets, client) {
	console.log("get_view");
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_monitores = new WsResponse("get_view");

	senhas = [];

	db.collection("senha").find({atendida: true}).toArray(function(err, res) {
		if (err) {throw err};
		for (var i = res.length-1; i > res.length-4; i--) {
			if (res[i]) {
				if (res[i].fila_sala != "nao_encaminhar" && res[i].fila_sala != null) {
					senhas.push(res[i]);
				}
			}
		}

		if (senhas.length > 0) {
			ws_response_to_monitores.header.action = "get_view";
			ws_response_to_monitores.body["senhas"] = senhas;
		} else {
			ws_response_to_monitores.header.action = "nenhuma_senha";
		}

		client.emit(ws_response_to_monitores.header.action, ws_response_to_monitores);
	});
}

exports.add_fila_sala = function(incoming_json_, sockets) {
	console.log("add_fila_sala");
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_geral = new WsResponse("add_fila_sala");
	ws_response_to_box_sala = new WsResponse("nova_fila");

	db.collection("fila_sala").find({apelido: incoming_json.body.fila.apelido})
	.toArray(function(err, result) {
		if (err) {throw err;}
		if (result.length > 0) {
			console.log("fila_sala já existe");
			ws_response_to_geral.body['response'] = "Fila já existente";
			sockets.geral.emit(ws_response_to_geral.header.action, ws_response_to_geral);
		} else {
			var fila = incoming_json.body.fila;
			db.collection("fila_sala").insertOne(fila, function(err, res) {
				if (err) {throw err};
				console.log("fila_sala inserted: ");
				console.log(res.ops[0]);
				ws_response_to_geral.body['response'] = "Fila adicionada";
				ws_response_to_box_sala.body['fila'] = res.ops[0];
				sockets.geral.emit(ws_response_to_geral.header.action, ws_response_to_geral);
				sockets.geral.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
			});
		}
	});
}

exports.select_all_filas = function(incoming_json_, sockets, client) {
	console.log("select_all_filas");
	ws_response_to_box_sala = new WsResponse("select_all_filas");
	db.collection("fila_sala").find({}).toArray(function(err, result) {
		if (err) {throw err;}
		ws_response_to_box_sala.body['fila_sala_list'] = result;
		db.collection("senha").find({atendida: true, atendida_sala: false})
		.toArray(function(err, result_2) {
			ws_response_to_box_sala.body['senhas_list'] = result_2;
			client.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
		});
	});
}

exports.select_all_filas_box = function(incoming_json_, sockets, client) {
	console.log("select_all_filas_box");
	ws_response_to_box = new WsResponse("select_all_filas_box");
	db.collection("fila_sala").find({}).toArray(function(err, result) {
		if (err) {throw err;}
		ws_response_to_box.body['fila_sala_list'] = result;
		db.collection("senha").find({atendida: true, atendida_sala: false})
		.toArray(function(err, result_2) {
			ws_response_to_box.body['senhas_list'] = result_2;
			client.emit(ws_response_to_box.header.action, ws_response_to_box);
		});
	});
}

exports.edit_fila = function(incoming_json_, sockets, client) {
	console.log("edit_fila");
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_box_sala = new WsResponse("edit_fila");

	db.collection("fila_sala").findOne({_id: new ObjectId(incoming_json.body.sala._id)}, function(err, result) {
		if (err) {throw err;}
		if (result) {
			var sala_ = result;
			sala_.medico = incoming_json.body.sala.medico;
			sala_.apelido = incoming_json.body.sala.apelido;
			db.collection("fila_sala").updateOne({_id: new ObjectId(incoming_json.body.sala._id)},
			sala_, function(err, result_2) {
				if (err) {throw err;}
				console.log(result_2);
				if (result_2) {
					ws_response_to_box_sala.body["sucesso"] = true;
				} else {
					ws_response_to_box_sala.body["sucesso"] = false;
				}

				client.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
			});
		}
	});
}

exports.insert_senha = function(incoming_json_, sockets, client) {
	console.log("insert_senha");
	incoming_json = JSON.parse(incoming_json_);

	ws_response_to_boxes = new WsResponse("nova_senha_em_espera");
	ws_response_to_totens = new WsResponse("solicitar_nova_senha");

	console.log(incoming_json);

	db.collection("senha").find({}).toArray(function(err, res) {
		if (err) {throw err};
		var prox_num = 1;

		if (res.length > 0) {
			prox_num = res[res.length-1].numero+1;
		}

		senha = {
			numero: prox_num,
			paciente: incoming_json.body.paciente,
			tipo_atendimento: incoming_json.body.tipo_atendimento,
			fila: incoming_json.body.fila,
			fila_sala: null,
			atendida: false,
			atendida_sala: false,
			criada: new Date(),
			finalizada: null,
			desistiu: false,
			em_atendimento_box: false,
			box: null,
		};

		db.collection("senha").insertOne(senha, function(err, res) {
			if (err) {throw err};
			console.log("Senha inserted: ");
			console.log(res.ops[0]);
			senha = res.ops[0];

			ws_response_to_totens.body['senha'] = senha;

			sockets.box.emit(ws_response_to_boxes.header.action, ws_response_to_boxes);
			client.emit(ws_response_to_totens.header.action, ws_response_to_totens);
		});
	});
}

exports.check_box = function (incoming_json_, client) {
	incoming_json = JSON.parse(incoming_json_);
	ws_response_to_box = new WsResponse("check_result");

	db.collection("box").findOne({'fields.ip': incoming_json.body.ip}, function(err, result) {
		if (err) throw err;
		if (result) {
			ws_response_to_box.body["success_check"] = true;
			ws_response_to_box.body["obj"] = result;
		} else {
			ws_response_to_box.body["success_check"] = false;
		}

		client.emit(ws_response_to_box.header.action, ws_response_to_box);
	});
}

// exports.activate_box = function () {
// 	incoming_json = JSON.parse(incoming_json_);
// 	ws_response_to_box = new WsResponse("activate_result");
//
// 	db.collection("box").findOne({'fields.chave': incoming_json.body.chave}, function(err, result) {
// 		if (err) throw err;
// 		if (result) {
// 			db.collection("box").updateOne({'fields.chave': incoming_json.body.chave},
// 				{'fields.ip': incoming_json.body.ip}, function(err, result_2) {
// 					if (err) throw err;
// 					if (result_2.result.ok && result_2.result.n > 0) {
// 						ws_response_to_box.body["success_check"] = true;
// 						ws_response_to_box.body["obj"] = result;
// 					} else {
// 						ws_response_to_box.body["success_check"] = false;
// 					}
//
// 					client.emit(ws_response_to_box.header.action, ws_response_to_box);
// 				});
// 		} else {
// 			ws_response_to_box.body["message"] = "Esta chave não existe"
// 		}
// 	});
// }

exports.check_box_sala = function (incoming_json_, client) {
	incoming_json = JSON.parse(incoming_json_);
	ws_response_to_box_sala = new WsResponse("check_result");

	db.collection("box").findOne({'fields.ip': incoming_json.body.ip}, function(err, result) {
		if (err) throw err;
		if (result) {
			ws_response_to_box_sala.body["success_check"] = true;
			ws_response_to_box_sala.body["obj"] = result;
		} else {
			ws_response_to_box_sala.body["success_check"] = false;
		}

		client.emit(ws_response_to_box_sala.header.action, ws_response_to_box_sala);
	});
}

exports.check_monitor = function (incoming_json_, client) {
	incoming_json = JSON.parse(incoming_json_);
	ws_response_to_monitor = new WsResponse("check_result");

	db.collection("monitor").findOne({'fields.ip': incoming_json.body.ip}, function(err, result) {
		if (err) throw err;
		if (result) {
			ws_response_to_monitor.body["success_check"] = true;
			ws_response_to_monitor.body["obj"] = result;
		} else {
			ws_response_to_monitor.body["success_check"] = false;
		}

		client.emit(ws_response_to_monitor.header.action, ws_response_to_monitor);
	});
}

exports.check_totem = function (incoming_json_, client) {
	incoming_json = JSON.parse(incoming_json_);
	ws_response_to_totem = new WsResponse("check_result");

	db.collection("totem").findOne({'fields.ip': incoming_json.body.ip}, function(err, result) {
		if (err) throw err;
		if (result) {
			ws_response_to_totem.body["success_check"] = true;
			ws_response_to_totem.body["obj"] = result;
		} else {
			ws_response_to_totem.body["success_check"] = false;
		}

		client.emit(ws_response_to_totem.header.action, ws_response_to_totem);
	});
}

verify_today_historico = function (db, today_date) {
	db.collection("historico").find({data: today_date}).toArray(function(err, result) {
		if (err) {throw err;}
		if (result.length == 0) {
			db.collection("historico").find({}).toArray(function(err, result_2) {
				if (result_2.length > 0) {
					historicos = result_2;
					db.collection("senha").find({}).toArray(function(err, result_3) {
						if (err) {throw err;}
						var historico = historicos[historicos.length-1];
						historico.quant_atendimentos = result_3.length;
						historico.senhas = result_3;

						var tempo_total = 0;
						for (var i = 0; i < historico.senhas.length; i++) {
							if (historico.senhas[i].criada && historico.senhas[i].finalizada) {
								tempo_total = tempo_total + historico.senhas[i].finalizada.getTime() - historico.senhas[i].criada.getTime();
							}
						}

						historico.tempo_medio_atendimento = millisToMinutesAndSeconds(tempo_total / historico.quant_atendimentos);
						db.collection("historico").updateOne({_id: new ObjectId(historico._id)}, historico, function(err, result_4) {
							if (err) {throw err;}
							if (result_4.result.ok && result_4.result.n > 0) {
								console.log("1 Record Updated, HISTORICO");
								db.collection("senha").deleteMany({}, function(err, result_delete) {
									if (err) {throw err;}
									console.log(result_delete.result.n + " senha(s) deletada(s)");
									historico = {data: today_date, quant_atendimentos: 0,
										tempo_medio_atendimento: null, senhas: []};
									db.collection("historico").insertOne(historico, function(err, res) {
										if (err) {throw err;}
										console.log("1 Record Inserted, HISTORICO");
									});
								});
							}
						});
					});
				} else {
					historico = {data: today_date, quant_atendimentos: 0,
						tempo_medio_atendimento: null, senhas: []};
					db.collection("historico").insertOne(historico, function(err, res) {
						if (err) {throw err;}
						console.log("1 Record Inserted, HISTORICO");
					});
				}
			});
		}
	});
}

exports.sync_box_with_web = function (objs) {
	db.collection("box").deleteMany({}, function(err, result) {
    if (err) throw err;
		db.collection("box").insertMany(objs, function(err, result_2) {
			if (err) throw err;
		});
  });
}

exports.sync_monitor_with_web = function (objs) {
	db.collection("monitor").deleteMany({}, function(err, result) {
    if (err) throw err;
		db.collection("monitor").insertMany(objs, function(err, result_2) {
			if (err) throw err;
		});
  });
}

exports.sync_totem_with_web = function (objs) {
	db.collection("totem").deleteMany({}, function(err, result) {
    if (err) throw err;
		db.collection("totem").insertMany(objs, function(err, result_2) {
			if (err) throw err;
		});
  });
}

exports.init_udp_autodiscover = function(server) {
	// START AutoDiscover server
	var server_json = JSON.stringify({
		id: server.model.pk,
		ip: server.local_ip,
		nome: server.model.fields.nome,
		email: server.model.fields.email,
		sou_server: true,
	});

	init_udp_autodiscover_server(server_json);
	// END
}

function init_udp_autodiscover_server(server_json) {
	var SERVER_PORT = 6024;
	var CLIENT_PORT = 6025;

	if (server_broadcast) {
		server_broadcast.close(
      function() {
        server_broadcast = null;
        init_udp_autodiscover_server(server_json);
      }
		);
	} else {
		server_broadcast = dgram.createSocket('udp4');

		server_broadcast.on('listening', function () {
		    var address = server_broadcast.address();
		    console.log('UDP Server listening on ' + address.address + ":" + address.port);
		    server_broadcast.setBroadcast(false);
		});

		server_broadcast.on('message', function (message, rinfo) {
		    console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - '+message.toString());
		    var message_to_send = new Buffer(server_json);
		    server_broadcast.send(message_to_send, 0, message_to_send.length, CLIENT_PORT, rinfo.address, function() {
		      console.log('Message sended to client ' + rinfo.address + ':' + CLIENT_PORT +'');
		    });
		});

		server_broadcast.bind(SERVER_PORT);
	}
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function WsResponse(action) {
	this.header = {action: action};
	this.body = {};
}
