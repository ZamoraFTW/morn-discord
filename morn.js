const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const request = require('request');
const client = new Discord.Client();

//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot.\n" +
	"!play [enlace]: Reproduce el sonido del video indicado en el [enlace], sin []. Función experimental, sujeta a fallos.\n" +
	"!stop: Para el sonido del video que se está reproduciendo.\n" +
	"!engramas: Devuelve la lista de poder actual de los distintos engramas e items que dan en el juego.\n" +
	"!recarga: Pone una bala en el cargador.\n" +
	"!dispara: Dispara la bala previamente recargada."


// Constantes accesibles desde Heroku
const txtAdministracion = process.env.ID_ADMINISTRACION;
const idServer = process.env.ID_SERVER;
const rolIniciado = process.env.ROL_INICIADO;
const urlEngramas = process.env.URL_ENGRAMAS;
let bala = false;
let arrPlanes = []

// Usar client.setTimeout (mirar docs) para funciones que se produzcan tras un delay

// Funciones justo despues de que el bot esté disponible e instanciado
client.on('ready', () => {
	// Establece el 'Jugando a' del bot en Discord
	client.user.setPresence({
		status: "online",
		game: {
			name: "!comandos",
			streaming: false,
			type: 1,
		}
	})
})

// **Negrita**

// Nuevo miembro entra al servidor.
client.on('guildMemberAdd', miembro => {
	client.guilds.get(idServer).defaultChannel.send("¡Tenemos un nuevo Guardián en el servidor!\nBienvenido, **" + miembro.user.username + "**");
	client.guilds.get(idServer).defaultChannel.send("Te he asignado el rol de Iniciado, ¡participa con el clan y serás ascendido!")
	miembro.addRole(rolIniciado);
})

// Miembro deja el servidor
client.on('guildMemberRemove', miembro => {
	client.guilds.get(idServer).defaultChannel.send("Parece que la Luz de **" + miembro.user.username + "** se ha agotado y ha dejado el servidor.");
	client.guilds.get(idServer).defaultChannel.send("¡Él se lo pierde! Nadie le echará de menos :cry:.")
})

// Cuando detecta un mensaje en el cliente
client.on('message', message => {


	//Corregir enagramas.
	if ((message.content.match(/enagrama/i)) && (message.author.id !== "375567137114423297")) {
		message.channel.send("Se dice \"engrama\", no \"enagrama\", <@" + message.author.id + ">. A ver si aprendemos a leer. :upside_down:");
	}

	//Interacción perros
	if ((message.content.match(/putos? perros?/i)) && (message.author.id !== "375567137114423297")) {
		message.channel.send("Puto perro tu madre, <@" + message.author.id + "> :rage:");
	} else if ((message.content.match(/\sperros?/i)) && (message.author.id !== "375567137114423297")) {
		message.channel.send("¡Oh! ¿Vais a hacer perros? Bien, os echo de menos :upside_down:.");
	}

	if (message.content.startsWith("!")) {
		if (message.content === '!comandos') {
			message.channel.send(lista);
		}
		if (message.content === '!recarga') {
			if (bala) {
				message.channel.send("Ya hay una bala cargada, dispara si te atreves con !dispara.");
			} else {
				message.channel.send("Bala cargada, aprieta el gatillo con !dispara.");
				bala = true;
			}
		}
		if (message.content === '!dispara') {
			if (bala) {
				//En proceso
				let numRandom = parseInt(Math.random() * 100) + 1;
				if (numRandom > 50) {
					message.channel.send("Estás muerto :dizzy_face: :skull:");
				} else {
					message.channel.send("Te salvaste... :rage: ");
				}
				bala = false;
			} else {
				message.channel.send("Recarga primero usando !recarga, luego dispara.");
			}
		}
		if (message.content.startsWith('!play')) {
			let videoUrl = message.content.split(" ");
			const voiceChannel = message.member.voiceChannel;
			if (videoUrl[1] == undefined) {
				return message.reply("pon un enlace al menos.");
			}
			if (!voiceChannel) {
				return message.reply("debes estar en un canal de voz");
			} else {
				message.reply("Reproduciendo " + videoUrl[1]);
				message.delete();
			}
			voiceChannel.join()
				.then(connnection => {
					const stream = ytdl(videoUrl[1], {
						filter: 'audioonly'
					});;
					const dispatcher = connnection.playStream(stream);
					dispatcher.on('end', () => voiceChannel.leave());
				});

		}
		if (message.content == '!stop') {
			const voiceChannel = message.member.voiceChannel;
			if (!voiceChannel) {
				message.reply("ni siquiera estoy y ya me quieres echar :(");
			} else {
				message.reply("adiós...");
				voiceChannel.leave();
			}
		}
		if (message.content.startsWith("!creaRaid")) {
			const partesMensaje = message.content.split(" ")
			const numero = Number(partesMensaje[1])
			if (numero) {
				if (existePlan(numero, 6)) {
					message.channel.send('Ya existe una raid con ese ID, usa otro.')
					return
				}
				message.channel.send('El usuario <@' + message.author.id + '> va a iniciar una raid')
				var raid = new Plan(numero, 6, message)
				arrPlanes.push(raid)
				message.channel.send('Apuntados hasta ahora: ')
				raid.dameLista(message.channel)
			} else {
				message.channel.send('Asegúrate de asignar un número identificativo a la raid. Ejemplo: !creaRaid 76')
			}
		}
		if (message.content.startsWith("!joinRaid")) {
			const partesMensaje = message.content.split(" ");
			const numero = Number(partesMensaje[1]);
			if (existePlan(numero, 6)) {
				var auxPlan = damePlan(numero, 6)
				if (auxPlan.lista.length == 6) {
					message.channel.send('La Raid ya está completa, puedes crear una con !creaRaid {identificador}')					
				} else {
					if (!repetido(auxPlan, message.author)) {
						auxPlan.lista.push(message.author)
						message.channel.send('<@' + message.author.id + '> se ha unido a la raid ' + numero.toString())
						message.channel.send('Lista de miembros apuntados:')
						auxPlan.dameLista(message.channel)
					} else {
						message.channel.send('Ya estás apuntado, no seas pesao.')
					}
				}
			} else {
				message.channel.send('No existe ese plan :|. Comprueba los planes con "!listaraids"')
			}
		}
		if (message.content.startsWith("!borraRaid")) {
			const partesMensaje = message.content.split(" ");
			const numero = Number(partesMensaje[1]);
			if (existePlan(numero, 6)) {
				if (borraPlan(numero, 6, message.author)) {
					message.channel.send('Raid borrada.')
				} else {
					message.channel.send('Solo el creador de la raid puede borrarla.')
				}
			} else {
				message.channel.send('No borrar algo que no existe, o sí, quien sabe.')
			}
		}
		if (message.content == "!listaRaids") {
			if (arrPlanes.length === 0) {
				message.channel.send('Aún no se ha creado ninguna raid. Crea una con "!creaRaid {Identificador}"')
			} else {
				message.channel.send('Listado de raids activas: ')
				let iAux = 0;
				let mensaje = "";
				for (var i = 0; i < arrPlanes.length; i++) {
					mensaje += 'Tipo de plan: **' + tipoPlan(arrPlanes[i].maxMembers) + '**\n';
					mensaje += 'Plazas: ' + arrPlanes[i].lista.length + '/' + arrPlanes[i].maxMembers + '\n';
					mensaje += 'ID de plan: ' + arrPlanes[i].id + '\n';
					mensaje += 'Creado: ' + arrPlanes[i].dameHora() + '\n';
					mensaje += 'Lista de miembros apuntados: \n';
					mensaje += arrPlanes[i].dameListaEnVariable(message.channel);
					message.channel.send(mensaje)
				}
			}
		}
		if (message.content.startsWith("!salirRaid")) {
			const partesMensaje = message.content.split(" ");
			const numero = Number(partesMensaje[1]);
			if (existePlan(numero, 6)) {
				var auxPlan2 = damePlan(numero, 6)
				if (repetido(auxPlan2, message.author)) {
					sacar(auxPlan2, message.author)
					message.channel.send('El jugador <@' + message.author.id + '> ha salido del plan ' + numero + '.')
					if (auxPlan2.lista.length === 0) {
						borraPlanSinMiembros(auxPlan2.id, 6)
						message.channel.send('El plan se ha quedado si miembros, borrando...')
					}
				} else {
					message.reply('No puedo sacarte de un plan en el que no estás.')
				}
			} else {
				message.reply('No existe ese plan')
			}
		}
		if (message.content == '!engramas') {
			request(urlEngramas, function (error, response, body) {
				console.log(message.author.username + " solicita información de los engramas");
				if (error != undefined) {
					message.channel.send("Error en los datos recibidos, prueba de nuevo en 5-10 segundos.");
				}
				var myArr = JSON.parse(body);
				var misVendedores = "Lista de poder de luz de los distintos drops que hay en el juego.\nRecordad que no son datos 100% fiables y si no están verificados menos aún." +
					" Todos los drops son valorados por cuentas de 305 de luz.\n\n"
				myArr.forEach(function (element) {
					switch (element.vendor) {
						case 0:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Devrim Kay   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Devrim Kay   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 1:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Miniherramienta MIDA   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Miniherramienta MIDA   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 2:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Sloane   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Sloane   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 3:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Failsafe   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Failsafe   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 4:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Asher Mir   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Asher Mir   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 5:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Man 'O War   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Man 'O War   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 7:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang:  Drang   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Drang   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 8:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Zavala   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Zavala   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 9:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Shaxx   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Shaxx   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 10:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Banshee-44   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Banshee-44   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 11:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Ikora   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Ikora   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 12:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Benedicto 99-40   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Benedicto 99-40   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 13:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Guerra Futura   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Guerra Futura   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 14:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Nueva Monarquía   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Nueva Monarquía   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}

							break;
						case 15:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Órbita Muerta   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Órbita Muerta   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 16:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Los Nueve   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Los Nueve   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
						case 17:
							if (element.type == 3 && element.verified == 1) {
								misVendedores += ":bangbang: Saladino   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							} else {
								misVendedores += "Saladino   ---   " + analizaEngrama(element.type) + "   ---  Verificado: " + verificado(element.verified) + "\n";
							}
							break;
					}
				}, this);
				misVendedores += "\n*Posible 300 quiere decir que aún no lo ha confirmado suficiente gente como para 'asegurar' que sea 300. Para que lo sea debe poner que está verificado.\n" +
					"*Podéis visitar la página https://vendorengrams.xyz/ y votar en función de lo que os haya salido a vosotros, para dar mas certeza a los datos." + "\n\nEstos datos cambian cada 30 minutos."
				message.channel.send(misVendedores);
			});
		}
	}
});

function verificado(numero) {
	if (numero == 0) {
		return "**NO**"
	} else {
		return "**SI**"
	}
}

function analizaEngrama(estado) {
	if (estado == 0) {
		return "**295.**"
	} else if (estado == 1) {
		return "**296-299.**"
	} else if (estado == 2) {
		return "**Posible 300.**"
	} else if (estado == 3) {
		return "**300.**"
	} else {
		return "**Se necesitan mas datos para analizar este drop.**"
	}
}

function Plan(id, maxMembers, message) {
	this.id = id
	this.maxMembers = maxMembers
	this.message = message
	this.autor = message.author
	this.lista = [message.author]
	this.hora = new Date()
	this.hora.setHours(this.hora.getHours() + 1)
}


Plan.prototype.dameLista = function (canal) {
	var strOut = ''
	for (var i = 0; i < this.lista.length; i++) {
		strOut = strOut.concat('<@' + this.lista[i].id + '>')
		if (i + 1 < this.lista.length) {
			strOut = strOut.concat(', ')
		}
	}
	// Sacado fuera del for para que solo envíe el mensaje al final
	canal.send(strOut)
}

Plan.prototype.dameListaEnVariable = function (canal) {
	var strOut = ''
	for (var i = 0; i < this.lista.length; i++) {
		strOut = strOut.concat('<@' + this.lista[i].id + '>')
		if (i + 1 < this.lista.length) {
			strOut = strOut.concat(', ')
		}
	}
	// Sacado fuera del for para que solo envíe el mensaje al final
	return strOut;
}

Plan.prototype.dameHora = function () {
	var strOut = this.hora.getHours() + ':'
	if (this.hora.getMinutes < 10) {
		strOut = strOut.concat('0')
	}
	strOut = strOut.concat(this.hora.getMinutes())
	return strOut
}

function sacar(plan, jugador) {
	for (var i = 0; i < plan.lista.length; i++) {
		if (jugador.id === plan.lista[i].id) {
			plan.lista.splice(i, 1)
		}
	}
}

// Comprueba si el jugador existe en el plan
function repetido(plan, jugador) {
	for (var i = 0; i < plan.lista.length; i++) {
		if (jugador.id === plan.lista[i].id) {
			return true
		}
	}
	return false
}

// Confirma si ya existe esa raid.
function existePlan(num, tipo) {
	for (var i = 0; i < arrPlanes.length; i++) {
		if ((arrPlanes[i].id === num) && (arrPlanes[i].maxMembers === tipo)) return true
	}
	return false
}

// Elimina una raid
function borraPlan(num, tipo, interesado) {
	for (var i = 0; i < arrPlanes.length; i++) {
		if ((arrPlanes[i].id === num) && (arrPlanes[i].maxMembers === tipo)) {
			console.log(arrPlanes[i].author + " \\\\\///// " + interesado)
			if (arrPlanes[i].autor == interesado) {
				arrPlanes.splice(i, 1)
				return true;
			} else {
				return false;
			}
		}
	}
}

function borraPlanSinMiembros(num, tipo) {
	for (var i = 0; i < arrPlanes.length; i++) {
		if ((arrPlanes[i].id === num) && (arrPlanes[i].maxMembers === tipo)) {
			arrPlanes.splice(i, 1)
		}
	}
}

function damePlan(num, tipo) {
	for (var i = 0; i < arrPlanes.length; i++) {
		if ((arrPlanes[i].id === num) && (arrPlanes[i].maxMembers === tipo)) {
			return arrPlanes[i]
		}
	}
}

// Traduce el tipo de plan según los miembros
function tipoPlan(num) {
	switch (num) {
		case 3:
			return 'Ocaso'
		case 4:
			return 'PvP'
		case 6:
			return 'Raid'
	}
}

// Proceso de login inicial del Bot, imprescindible para su funcionamiento AL FINAL DEL FICHERO
client.login(process.env.BOT_TOKEN)