const {Client} = require("discord.js-selfbot-v13");
const client = new Client();
const config = require("./data.config.json");
const continueFunc = require("./util/continueFlag");
const mongoose = require("mongoose")
const {addChannels, newLog} = require("./util/conversationManager");
const logger = require("./util/logger");

client.on("ready", () => {
    logger.info(`${client.user.username} is online`);
    main().then(() => logger.info("Database Connected!")).catch((err) => logger.error(err));
    addChannels();
});

client.on("messageCreate", async (message) => {
    if (!continueFunc(message)) return;
    if(message.content.length > 0){
        await newLog("MESSAGE", message, message.channelId, client);
        logger.debug(`New message in ${message.channelId}`)
    }
    if(message.attachments.size > 0){
        await newLog("IMAGE", message, message.channelId, client);
        logger.debug(`New image in ${message.channelId}`)
    }
});

client.on("messageReactionAdd", async (messageReaction, user) => {
    if (!continueFunc(messageReaction.message)) return;
    await newLog("REACTION", {messageReaction, user}, messageReaction.message.channelId, client)
    logger.debug(`New reaction in ${messageReaction.message.channelId}`)
})

client.login(config.discordToken).then(() => {
    logger.info(`${client.user.username} is logged in`);
});



async function main(){
    await mongoose.connect(config.mongoDB);
}

process.on('uncaughtException', (err) => {
    logger.error('There was an uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
