const userModel = require("../schema/user");
const cleanText = require("./cleanText");
const fetchUID = require("./fetchUID");

async function parseMessages(channelConvo, client) {
    let messages = []

    for (const {data, type} of channelConvo){
        switch (type){
            case "MESSAGE":
                // Returns Message class as data
                const {createdNew, uid} = await fetchUID(data.author)
                if(!uid) return console.error(`Could not find UID of ${data.author.username} (${data.author.id})`)
                let messageString = `[user${uid}]: ${await cleanText(data, client)}`
                if(data.reference){
                    const messageRef = await data.fetchReference();
                    const replyingToUID = await fetchUID(messageRef.author);

                    if(!messageRef) return console.error(`Could not find Message Reference for ${data.id}`);
                    if(!replyingToUID) return console.error(`Could not find UID for ${messageRef.author.username}`)

                    messageString += `\n\t- [replyingTo|user${replyingToUID.uid}]: ${messageRef.attachments.size > 0 && messageRef.content.length < 1 ? "image" : await cleanText(messageRef, client)}`;
                }
                messages.push(messageString);
                break;
            case "REACTION":
                // Returns {messageReaction, user} as data
                const reactorUID = await fetchUID(data.user);
                const reacteeUID = await fetchUID(data.messageReaction.message.author)

                if(!reactorUID) return console.error(`Could not find Reactor UID for ${data.user.username}`);
                if(!reacteeUID) return console.error(`Could not find Reactee UID for ${data.messageReaction.message.author.username}`);

                messages.push(`[EVENT|REACTION]: user${reactorUID.uid} reacted to user${reacteeUID.uid} "${await cleanText(data.messageReaction.message, client)}" with ${data.messageReaction.emoji.name}`);
                break;
            case "IMAGE":
                // Returns Message class as data
                const senderUID = await fetchUID(data.author);

                if(!senderUID) return console.error(`Could not find image sender UID for ${data.author.username}`)

                messages.push(`[EVENT|IMAGE]: user${senderUID.uid} sent an image`);
                break;
        }
    }

    return messages;
}

module.exports = parseMessages;