const config = require("../config.json");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendMessage(aiMessage, discordMessage) {
    const responseLength = discordMessage.content.length;
    const readingTime = config.comprehendTimes.reading * responseLength;
    const comprehendTime = config.comprehendTimes.comprehend * responseLength;

    await delay(randomUpperAndLower(readingTime, 20) + randomUpperAndLower(comprehendTime, 10));

    const typingTime = randomUpperAndLower(config.comprehendTimes.typing * aiMessage.content.length, 200);

    await discordMessage.channel.sendTyping()
    await delay(typingTime)

    if(aiMessage.replyMessageID){
        const replyMessage = await discordMessage.channel.messages.fetch(aiMessage.replyMessageID)
        await replyMessage.reply(aiMessage.content)
    } else {
        discordMessage.channel.send(aiMessage.content);
    }
}

function randomUpperAndLower(number, bounds){
    return Math.floor(Math.random() * ((number + bounds) - (number - bounds)) + number - bounds);
}

module.exports = sendMessage;