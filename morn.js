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
			var misVendedores = "";
			myArr.forEach(function (element) {
				switch (element.vendor) {
					case 0:
					misVendedores = "Devrim Kay -> " + analizaEngrama(element.type) + " Verificado -> " + verificado(element.verified);
						break;
				}
			}, this);
			message.reply(misVendedores);
		});
	}
});

function verificado(numero) {
	if (numero == 0) {
		return "SI"
	} else {
		return "NO"
	}
}

function analizaEngrama(estado) {
	if (estado == 0) {
		return "Engramas de 295."
	} else if (estado == 1) {
		return "Engramas de 296-299."
	} else if (estado == 2) {
		return "Posibles engramas de 300."
	} else if (estado == 3) {
		return "Engramas de 300."
	} else {
		return "Se necesitan mas datos para analizar este vendedor."		
	}
}

// Proceso de login inicial del Bot, imprescindible para su funcionamiento AL FINAL DEL FICHERO
client.login(process.env.BOT_TOKEN);