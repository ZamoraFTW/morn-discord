const Discord = require('discord.js');
const ytdl = require('ytdl-core');
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
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.reply("Para poner un vídeo debes estar en un canal de voz");
			voiceChannel.join()
		  	.then(connnection => {
			const stream = ytdl("https://www.youtube.com/watch?v=dQw4w9WgXcQ", { filter: 'audioonly' });
			var url = ytdl(url, { filter: (format) => format.container === 'mp4' })
			.pipe(fs.createWriteStream('video.mp4'));
			const dispatcher = connnection.playStream(stream);
			dispatcher.on('end', () => voiceChannel.leave());
		  });
	}
});

// Proceso de login inicial del Bot, imprescindible para su funcionamiento AL FINAL DEL FICHERO
client.login(process.env.BOT_TOKEN);