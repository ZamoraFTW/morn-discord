const Discord = require('discord.js');
const Twitter = require('twitter');
const client = new Discord.Client();

//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot" 

// Variable para la conexion con la API de Twitter 	
var tw = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Proceso de login inicial del Bot, imprescindible para su funcionamiento
client.login(process.env.BOT_TOKEN);
	
client.on('message', message => {
	if (message.content === '!comandos') {
    	message.reply(lista);
	}
	if (message.content === '!tweets') {

  	}
});

var stream = tw.stream('statuses/filter', {track: '@BungieHelp'});
var channel = client.guilds;
for (var k in channel) {
	console.log(k)
}
stream.on('data', function(event) {
  console.log(event && event.text);
});
