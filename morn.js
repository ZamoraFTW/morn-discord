const Discord = require('discord.js');
const Twitter = require('twitter');
const client = new Discord.Client();

//Constante con la lista de comandos disponibles, modificar simpre que se añada o se borre un comando. Separarlos con \n
const lista = "\nLista de comandos disponibles: \n\n" +
	"!comandos : Devuelve la lista de comandos disponibles en el bot" 
// Canal de texto de administracion
const txtAdministracion = process.env.ID_AMINISTRACION;
// ID del servidor
const idServer = process.env.ID_SERVER;

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
	if (message.content === '!esteCanal') {
		message.reply(message.guild.id);
  	}
});
var servidor = client.guilds;
var array = Array.from(servidor.values());
array.forEach(function(element) {
    console.log(element);
});
tw.stream('statuses/filter', {track: '@BungieHelp'}, function(stream) {
	stream.on('data', function(event) {
	});
   
	stream.on('error', function(error) {
	  throw error;
	});
  });
