const userModel = require("../schema/user")

async function parseResponse(res, discordMessage) {
    const regex = /^(user\d+):\s(.*?)(\s*\(Replying to (user\d+): (.*)\))?$/g
    const matches = [...res.matchAll(regex)]
    const message = {
        content: "",
        replyingUID: null,
        replyingMessage: null,
        replyMessageID: null,
    }

    for (const match of matches) {
        if(match[3]) {
            message.replyingUID = match[4].replace("user", "")
            message.replyingMessage = match[5]
        }
        message.content = match[2];
    }

    message.content = message.content.replace("<LB>", "\n");

    if(message.replyingUID){
        const userDoc = await userModel.findOne({uid: message.replyingUID})
        const userID = userDoc ? userDoc.id : null
        if(userID){
            const channelMessages = await discordMessage.channel.messages.fetch();
            for (const [id, channelMessage] of channelMessages) {
                if(channelMessage.author.id.toString() === userID && channelMessage.content === message.replyingMessage){
                    message.replyMessageID = id;
                }
            }
        }
    }

    return message;

}

module.exports = parseResponse