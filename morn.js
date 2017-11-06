const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
	
	const lista = "\nLista de comandos disponibles: \n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot" 
	
    if (message.content === 'ping') {
    	message.reply('pong');
  	}
	if (message.content === '!comandos') {
    	message.reply(lista);
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
