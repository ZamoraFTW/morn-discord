const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const client = new Discord.Client();
const request = require('request');
//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot.\n" +
	"!play [enlace]: Reproduce el sonido del video indicado en el [enlace], sin []. Función experimental, sujeta a fallos.\n" +
	"!stop: Para el sonido del video que se está reproduciendo."


// Canal de texto de administracion
const txtAdministracion = process.env.ID_ADMINISTRACION;
// ID del servidor
const idServer = process.env.ID_SERVER;


client.on('message', message => {
	if (message.content === '!comandos') {
		message.reply(lista);
	}
	if (message.content === '!esteCanal') {
		message.reply(message.channel.id);
	}
	if (message.content.startsWith('!play')) {
		let videoUrl = message.content.split(" ");
		const voiceChannel = message.member.voiceChannel;
		if (videoUrl[1] == undefined) {
			return message.reply("play qué, atontao. Pon un enlace al menos.");
		}
		if (!voiceChannel) {
			return message.reply("para poner una canción debes estar en un canal de voz");
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
			message.reply("");
		} else {
			message.reply("adiós...");
			voiceChannel.leave();
		}
	}
	if (message.content == '!engramas') {
		request('https://api.vendorengrams.xyz/getVendorDrops?key=b93851b99ee05d18fbaa5380a0896217', function (error, response, body) {
			var myArr = JSON.parse(body);
			var misVendedores = "Lista de poder de luz de los distintos drops que hay en el juego.\n Recordad que no son datos 100% fiables y si no están verificados menos aún." +
				" Todos los drops son valorados por cuentas de 305 de luz.\n"
			myArr.forEach(function (element) {
				switch (element.vendor) {
					case 0:
						misVendedores += "Devrim Kay -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 1:
						misVendedores += "Miniherramienta MIDA -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 2:
						misVendedores += "Sloane -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 3:
						misVendedores += "Failsafe -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 4:
						misVendedores += "Asher Mir -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 5:
						misVendedores += "Man 'O War -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 7:
						misVendedores += "Drang -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 8:
						misVendedores += "Zavala -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 9:
						misVendedores += "Shaxx -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 10:
						misVendedores += "Banshee-44 -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 11:
						misVendedores += "Ikora -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 12:
						misVendedores += "Benedicto 99-40 -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 13:
						misVendedores += "Guerra Futura -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 14:
						misVendedores += "Nueva Monarquía -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 15:
						misVendedores += "Órbita Muerta -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 16:
						misVendedores += "Los Nueve -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
					case 17:
						misVendedores += "Saladino -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified) + "\n";
						break;
				}
			}, this);
			misVendedores += "\n*Posible 300 quiere decir que aún no lo ha confirmado suficiente gente como para 'asegurar' que sea 300. Para que lo sea debe poner que está verificado.\n" +
				"*Los datos de la página actualmente pertenecen a PS4 y Xbox One, aún no está confirmado que vayan acordes con los de PC." + "\nEstos datos cambian cada 30 minutos."
			message.channel.send(misVendedores);
		});
	}
});

function verificado(numero) {
	if (numero == 0) {
		return "NO"
	} else {
		return "SI"
	}
}

function analizaEngrama(estado) {
	if (estado == 0) {
		return "295."
	} else if (estado == 1) {
		return "296-299."
	} else if (estado == 2) {
		return "Posible 300. "
	} else if (estado == 3) {
		return "300."
	} else {
		return "Se necesitan mas datos para analizar este drop."
	}
}

// Proceso de login inicial del Bot, imprescindible para su funcionamiento AL FINAL DEL FICHERO
client.login(process.env.BOT_TOKEN);