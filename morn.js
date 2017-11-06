const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
	
	const lista = "Lista de comandos \n" +
	"Hola" 
	
    if (message.content === 'ping') {
    	message.reply('pong');
  	}
	if (message.content === '!comandos') {
    	message.reply(lista);
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
