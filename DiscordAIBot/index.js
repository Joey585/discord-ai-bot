const {Client} = require("discord.js-selfbot-v13");
const config = require("./config.json");
const messageToConvo = require("./util/messageToConvo");
const mongoose = require("mongoose");
const axios = require("axios");
const parseResponse = require("./util/parseResponse");
const sendMessage = require("./util/sendMessage");

const client = new Client();

client.on("ready", () => {
    console.log(client.user.username + " is online!");
});

client.on("messageCreate", async (message) => {
    if (message.author.id === client.user.id) return;
    if (message.author.bot) return;
    for (const serverID of config.blacklistedServers){
        if(message.guild) {
            if(message.guild.id === serverID) return;
        }
    }

    let respondFlag = false;

    for (const name of config.names) {
        if (message.content.includes(name)) respondFlag = true;
    }
    if (message.mentions.users.has(client.user.id)) respondFlag = true;
    if (message.reference) {
        const referenceUser = (await message.channel.messages.cache.get(message.reference.messageId)).author.id
        if(referenceUser === client.user.id) respondFlag = true;
    }

    if(message.channel.constructor.name === "DMChannel") respondFlag = true;

    if(Math.round(Math.random() * 50) === 0) respondFlag = true;

    if(!respondFlag) return;

    const conversation = (await messageToConvo(message, client)).join("\n");
    const raw_res = (await axios.post(config.AIBackend + "/generate", {conversation})).data;
    const aiMessage = await parseResponse(raw_res.response, message);
    await sendMessage(aiMessage, message);
    console.log("Sent message in " + message.channel.id)
});

async function main(){
    await mongoose.connect(config.mongoDB);
    console.log("MongoDB Connected!");
}


client.login(config.discordToken).then(() => {
    main()
});