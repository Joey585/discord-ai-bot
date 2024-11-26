const conversationMap = new Map();
const {channelWhitelist, minuteCooldown, conversationLimit} = require("../data.config.json");
const parseMessages = require("./parseMessages");
const logger = require("./logger");

function addChannels(){
    for (const channelID of channelWhitelist){
        logger.debug(`Adding channel ${channelID} to the Map memory`);
        conversationMap.set(channelID, {
            mostRecentMessage: null,
            eventLog: []
        });
    }
}

async function newLog(type, data, channelID, client) {
    // type can either be MESSAGE, REACTION, IMAGE
    /*
    MESSAGE - A message was sent in the conversation
    REACTION - A reaction was added to a message in the channel
    IMAGE - A user sent a message, important for context
     */
    const channel = conversationMap.get(channelID.toString());

    if(channel.mostRecentMessage === null || Date.now() - channel.mostRecentMessage < 1000 * 60 * minuteCooldown){
        if(channel.eventLog.length > conversationLimit){
            logger.debug("Enough messages were sent for 1 conversation");
            let eventLog = [...channel.eventLog];
            channel.mostRecentMessage = null;
            channel.eventLog = []
            channel.eventLog.push({type, data});
            await parseMessages(eventLog, client);
            eventLog.length = 0;
            return;
        }

        logger.debug(`Adding new logs to current conversation event, it is withing ${minuteCooldown} minutes!`)
        channel.eventLog.push({type, data});
        channel.mostRecentMessage = Date.now();
        return;
    }

    // Has it been more than the minutes provided since the last log was recorded?

    if(Date.now() - channel.mostRecentMessage > 1000 * 60 * minuteCooldown){
        if(channel.eventLog.length < 2) {
            channel.mostRecentMessage = null;
            channel.eventLog.push({type, data});
            logger.info("Holding off registration for more messages");
            return;
        }

        logger.debug(`Log was sent after the cooldown, pushing to registry...`)
        let eventLog = [...channel.eventLog];
        channel.mostRecentMessage = null;
        channel.eventLog = []
        channel.eventLog.push({type, data});
        await parseMessages(eventLog, client)
        eventLog.length = 0;
    }





}

module.exports = {addChannels, newLog};