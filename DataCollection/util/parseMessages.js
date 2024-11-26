const {dataVersion} = require("../data.config.json");
const userModel = require("../schema/user");
const fs = require("fs");
const cleanText = require("./cleanText");
const fetchUID = require("./fetchUID");
const logger = require("./logger");

async function parseMessages(channelConvo, client, increment=true, returnData=false) {
    let messages = []

    for (const {data, type} of channelConvo){
        switch (type){
            case "MESSAGE":
                // Returns Message class as data
                const {createdNew, uid} = await fetchUID(data.author)
                if(!uid) return logger.error(`Could not find UID of ${data.author.username} (${data.author.id})`)
                if(!createdNew && increment) {
                    await userModel.findOneAndUpdate({id: data.author.id}, {$inc: {messages: 1}});
                    logger.debug(`Incrementing ${data.author.username}'s messages by 1`);
                }
                let messageString = `[user${uid}]: ${await cleanText(data, client)}`
                if(data.reference){
                    logger.debug(`A reply exits in the message, adding to registry...`)
                    const messageRef = await data.fetchReference();
                    const replyingToUID = await fetchUID(messageRef.author);

                    if(!messageRef) return logger.error(`Could not find Message Reference for ${data.id}`);
                    if(!replyingToUID) return logger.error(`Could not find UID for ${messageRef.author.username}`)

                    messageString += `\n\t- [replyingTo|user${replyingToUID.uid}]: ${messageRef.attachments.size > 0 && messageRef.content.length < 1 ? "image" : await cleanText(messageRef, client)}`;
                }
                messages.push(messageString);
                logger.debug("Added parsed MESSAGE event to log");
                break;
            case "REACTION":
                // Returns {messageReaction, user} as data
                const reactorUID = await fetchUID(data.user);
                const reacteeUID = await fetchUID(data.messageReaction.message.author)

                if(!reactorUID) return logger.error(`Could not find Reactor UID for ${data.user.username}`);
                if(!reacteeUID) return logger.error(`Could not find Reactee UID for ${data.messageReaction.message.author.username}`);

                messages.push(`[EVENT|REACTION]: user${reactorUID.uid} reacted to user${reacteeUID.uid} "${await cleanText(data.messageReaction.message, client)}" with ${data.messageReaction.emoji.name}`);
                logger.debug("Added parsed REACTION event to log");
                break;
            case "IMAGE":
                // Returns Message class as data
                const senderUID = await fetchUID(data.author);

                if(!senderUID) return logger.error(`Could not find image sender UID for ${data.author.username}`)

                messages.push(`[EVENT|IMAGE]: user${senderUID.uid} sent an image`);
                logger.debug("Added parsed IMAGE event to log");
                break;
        }
    }

    if(returnData) return messages;


    await fs.appendFileSync("./data/" + dataVersion + ".txt", "[CONVERSATION START]\n");
    for (const message of messages){
        await fs.appendFileSync("./data/" + dataVersion + ".txt", message + "\n");
    }
    fs.appendFileSync("./data/" + dataVersion + ".txt", "[CONVERSATION END]\n\n");
    logger.info("Added a new conversation to the registry!");

    return null;
}

module.exports = parseMessages;