const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const client = new Discord.Client();
const request = require('request');

//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot.\n" +
	"!play [enlace]: Reproduce el sonido del video indicado en el [enlace], sin []. Función experimental, sujeta a fallos.\n" +
	"!stop: Para el sonido del video que se está reproduciendo.\n" +
	"!engramas: Devuelve la lista de poder actual de los distintos engramas e items que dan en el juego.\n" +
	"!recarga: Pone una bala en el cargador.\n" +
	"!dispara: Dispara la bala previamente recargada."


// ID del canal de texto de administracion
const txtAdministracion = process.env.ID_ADMINISTRACION;
// ID del servidor
const idServer = process.env.ID_SERVER;
const rolIniciado = process.env.ROL_INICIADO;
let bala = false;


// Funciones justo despues de que el bot esté disponible e instanciado
client.on('ready', miembro => {
	client.user.setPresence({
		status: "online",
		game: {
			name: "De paseo con Calus | !help"
		}
	})
})

// Nuevo miembro entra al servidor.
client.on('guildMemberAdd', miembro => {
	client.guilds.get(idServer).defaultChannel.send("¡Tenemos un nuevo Guardián en el servidor!\nBienvenido, " + miembro.user.username);
	client.guilds.get(idServer).defaultChannel.send("Te he asignado el rol de Iniciado, ¡participa con el clan y serás ascendido!")
	miembro.addRole(rolIniciado);
})

// Miembro deja el servidor
client.on('guildMemberRemove', miembro => {
	client.guilds.get(idServer).defaultChannel.send("Parece que la Luz de " + miembro.user.username + " se ha agotado y ha dejado el servidor.");
	client.guilds.get(idServer).defaultChannel.send("¡Él se lo pierde! Nadie le echará de menos :cry:.")
})

// Cuando detecta un mensaje en el cliente
client.on('message', message => {
	if (message.startsWith("!")) {
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
		if (message.content == '!engramas') {
			request('https://api.vendorengrams.xyz/getVendorDrops?key=b93851b99ee05d18fbaa5380a0896217', function (error, response, body) {
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

// Proceso de login inicial del Bot, imprescindible para su funcionamiento AL FINAL DEL FICHERO
client.login(process.env.BOT_TOKEN)