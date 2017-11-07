const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const client = new Discord.Client();
//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot"
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
		console.log(videoUrl[1]);
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) {
			return message.reply("Para poner una canción debes estar en un canal de voz");
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
			message.reply("¿Estás bien? ¿Quieres que hablemos?");
		} else {
			message.reply("Vale, adiós...");
			voiceChannel.leave();
		}
	}
});

// Proceso de login inicial del Bot, imprescindible para su funcionamiento AL FINAL DEL FICHERO
client.login(process.env.BOT_TOKEN);