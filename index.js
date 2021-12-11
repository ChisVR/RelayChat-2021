const config = require("./config.json");
const {
    client_id,
    client_secret
} = require('./credentialsyt.json').web

const express = require('express')
const appyt = new express()

const FormData = require('form-data');
const Vimm = require("vimm-chat-lib");
const tmi = require('tmi.js');
const chalk = require('chalk');
const clear = require('clear');
const fetch = require('node-fetch');
var util = require('util');

const messageListener = require('./ytlib/message/messageListener')
const messageSender = require('./ytlib/message/messageSender')
const accessTokenManager = require('./ytlib/auth/accessTokenManager')

const ttvclient = new tmi.Client({
    options: {
        debug: false
    },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: config.twitch.username,
        password: config.twitch.oauth
    },
    channels: config.twitch.channel
});


const atm = new accessTokenManager(require('./credentialsyt.json').web, config.youtube.resettoken)

const listener = new messageListener(config.youtube.apikey, config.youtube.chatID)
const ytsender = new messageSender({
    apiKey: config.youtube.apikey,
    chatID: config.youtube.chatID,
    accessTokenManager: atm
})


const chat = new Vimm.VimmChat({
    token: config.vimmtv.token,
    debug: false

})

const Glimesh = require("glimesh-chat-lib")
const chatglimesh = new Glimesh.GlimeshChat({
	token: config.glimesh.token,
	clientId: config.glimesh.clientid,
	debug: false // Outputs heartbeat logs if true.
})

console.log(`
${chalk.grey('--------------------------------------------------')}
${chalk.yellow('              Welcome to VimmTV to Twitch BOT ')}
${chalk.green('          This where Relay from VimmTV to Discord')}
${chalk.green('       BOT is Open source but not allowed steal CODES')}
${chalk.green(' All codes been made Copyrighted and Writen by ChisdealHDYT')}
${chalk.green('       Make sure Like this Project and Fork it if want.')}
${chalk.green('       Check BOT Creaotr Socials Below for Updates')}
${chalk.grey('--------------------------------------------------')}
`);

console.log(`
${chalk.grey('--------------------------------------------------')}
${chalk.yellow('                   Creator Of BOT ')}
${chalk.green('            Username: ') + 'ChisdealHDYT#7172'}
${chalk.green('         Discord Link: ') + 'discord.gg/RYscPHc'}
${chalk.green('          Twitch: ') + 'twitch.tv/chisdealhdyt'}
${chalk.green('           VimmTV: ') + 'www.vimm.tv/chisdealhd'}
${chalk.green('         YouTube: ') + 'youtube.com/chisdealhd'}
${chalk.green('         Twitter: ') + 'twitter.com/chisdealhd'}
${chalk.grey('--------------------------------------------------')}
`);

ttvclient.connect();


//////////////////////////////YOUTUBE///////////////////////////////

listener.on('message', message => {

	if(message.author.channelId == config.youtube.botChannelID) return

	ttvclient.say(config.twitch.channelusername, `[YOUTUBE] ${message.author.displayName}: ${message.snippet.content}`);
					
	chatglimesh.sendMessage(`[YOUTUBE] ${message.author.displayName}: ${message.snippet.content}`);
		
	chat.sendMessage(config.vimmtv.connect, `[YOUTUBE] ${message.author.displayName}: ${message.snippet.content}`);

	var msgvimmrelay = `[YOUTUBE] ${message.author.displayName}: ${message.snippet.content}`;

	fetch("https://api.theta.tv/v1/channel/" + config.theta.channelid + "/channel_action", {
		body: "{\"type\":\"chat_message\",\"message\":\"" + msgvimmrelay + "\"}",
		headers: {
			"Content-Type": "application/json",
			"X-Auth-Token": config.theta.token,
			"X-Auth-User": config.theta.user
		},
		method: "POST"
	})

})
///////////////////////////////////////////////////////////////////





//////////////////////////////GLIMESH//////////////////////////////
chatglimesh.connect(config.glimesh.channel).then(meta => { 

	chatglimesh.on("message", msgglim => {
		
		if(msgglim.user.username == config.glimesh.botUsername) return
		
		chat.sendMessage(config.vimmtv.connect, `[GLIMESHTV] ${msgglim.user.username}: ${msgglim.message}`);
		ttvclient.say(config.twitch.channelusername, `[GLIMESHTV] ${msgglim.user.username}: ${msgglim.message}`);
		ytsender.sendMessage(`[GLIMESHTV] ${msgglim.user.username}: ${msgglim.message}`);
		
		var msgvimmrelay = `[GLIMESHTV] ${msgglim.user.username}: ${msgglim.message}`;

		fetch("https://api.theta.tv/v1/channel/" + config.theta.channelid + "/channel_action", {
			body: "{\"type\":\"chat_message\",\"message\":\"" + msgvimmrelay + "\"}",
			headers: {
				"Content-Type": "application/json",
				"X-Auth-Token": config.theta.token,
				"X-Auth-User": config.theta.user
			},
			method: "POST"
		})
					
	})

})
///////////////////////////////////////////////////////////////////





//////////////////////////////THETATV//////////////////////////////
var PubNub = require("pubnub");

var pubnub = new PubNub({
	uuid: config.theta.pubnub.uuid,
	subscribe_key: config.theta.pubnub.subscribe_key
});

pubnub.subscribe({
	channels: config.theta.channels
});

pubnub.addListener({
	message: function(message) {

		if (message.message.data.user.username == config.theta.username) return
                    
		if (message.message.data.text == "") return
                    
		chat.sendMessage(config.vimmtv.connect, `[THETATV] ${message.message.data.user.username}: ${message.message.data.text}`);
		
		ttvclient.say(config.twitch.channelusername, `[THETATV] ${message.message.data.user.username}: ${message.message.data.text}`);
		
		chatglimesh.sendMessage(`[THETATV] ${message.message.data.user.username}: ${message.message.data.text}`);
		
		ytsender.sendMessage(`[THETATV] ${message.message.data.user.username}: ${message.message.data.text}`);
		
	},
	
	presence: function(presenceEvent) {
		console.log(presenceEvent);
	}
});
///////////////////////////////////////////////////////////////////





//////////////////////////////VIMMTV//////////////////////////////
chat.connect(config.vimmtv.connect).then(meta => {


	chat.on("message", msg => {

		if (msg.prefix == "[bot]") return

		ttvclient.say(config.twitch.channelusername, `[VIMMTV] ${msg.chatter}: ${msg.message}`);
					
		chatglimesh.sendMessage(`[VIMMTV] ${msg.chatter}: ${msg.message}`);
		
		ytsender.sendMessage(`[VIMMTV] ${msg.chatter}: ${msg.message}`);

		var msgvimmrelay = `[VIMMTV] ${msg.chatter}: ${msg.message}`;

		fetch("https://api.theta.tv/v1/channel/" + config.theta.channelid + "/channel_action", {
			body: "{\"type\":\"chat_message\",\"message\":\"" + msgvimmrelay + "\"}",
			headers: {
				"Content-Type": "application/json",
				"X-Auth-Token": config.theta.token,
				"X-Auth-User": config.theta.user
			},
			method: "POST"
		})

	})

	chat.on("close", event => {

		console.log(event)


		if (event == 1006) {

			chat.connect(config.vimmtv.connect) // If Abnormal disconnect (1006), Glimesh Bot reconnects.

		}
	})
})
////////////////////////////////////////////////////////////////////





//////////////////////////////TWITCHTV//////////////////////////////
ttvclient.on('connected', (address, port) => {

    console.log("Connected to Twitch IRC");

	ttvclient.on('message', (channel, tags, message, self) => {

		if (self) return;

		if (tags.username == config.twitch.username || tags.username == "nightbot" || tags.username == "streamelements" || tags.username == "twitchwaifus") return

		chat.sendMessage(config.vimmtv.connect, `[TWITCH] ${tags.username}: ${message}`);
		
		chatglimesh.sendMessage(`[TWITCH] ${tags.username}: ${message}`);
		
		ytsender.sendMessage(`[TWITCH] ${tags.username}: ${message}`);

		fetch("https://api.theta.tv/v1/channel/" + config.theta.channelid + "/channel_action", {
			body: "{\"type\":\"chat_message\",\"message\":\"[TWITCH] " + tags.username + ": " + message + "\"}",
			headers: {
				"Content-Type": "application/json",
				"X-Auth-Token": config.theta.token,
				"X-Auth-User": config.theta.user
			},
			method: "POST"
		})

    })
	
});
///////////////////////////////////////////////////////////////////


////////////////////////TOKEN GENERATOR///////////////////////////



appyt.get('/', (req, res) => {
    if (req.query.code != null) {
        var form = new FormData();
        form.append('code', req.query.code)
        form.append('redirect_uri', "http://localhost:3000")
        form.append('client_id', client_id),
        form.append('client_secret', client_secret)
        form.append('grant_type', "authorization_code")
        fetch(`https://www.googleapis.com/oauth2/v4/token`, {
                method: "POST",
                body: `grant_type=authorization_code&code=${req.query.code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=http://localhost:3000`,
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                }
            })
            .then(data => data.json())
            .then(data => res.send(data.refresh_token))
            .catch(err => {
                console.error(err)
                res.send("Error has ocurred " + err)
            })
        return

    }
    var link = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:3000&prompt=consent&response_type=code&client_id=${client_id}&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly&access_type=offline`
    res.write(`
        <a href="${link}">Get your token</a>
    `)
})
appyt.get('/{token}', (req, res) => {

})

appyt.listen(3000, () => console.log('Example app listening on port 3000, THIS USED OAUTH2 YOUR YT BOT!'))




/////////////////////////////////////////////////////////////////