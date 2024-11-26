const parseMessages = require("./parseEventLog");
const getDataTypes = require("./getDataTypes");

async function messageToConvo(message, client) {
    const messages = await message.channel.messages.fetch({limit: 20});
    let messageLog = []
    for (const [id, message] of messages) {
        messageLog.push(message);
    }
    messageLog = messageLog.reverse();
    const eventLog = await getDataTypes(messageLog);
    return await parseMessages(eventLog, client, false, true);
}

module.exports = messageToConvo;