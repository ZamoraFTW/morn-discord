const Discord = require('discord.js');
const client = new Discord.Client();

//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot" 
	
client.on('message', message => {
	if (message.content === '!comandos') {
    	message.reply(lista);
  	}
});

// Proceso de login inicial del Bot, imprescindible para su funcionamiento
client.login(process.env.BOT_TOKEN);
