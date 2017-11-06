const Discord = require('discord.js');
const client = new Discord.Client();
//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot" 
client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
	
	if (message.content === '!comandos') {
    	message.reply(lista);
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
