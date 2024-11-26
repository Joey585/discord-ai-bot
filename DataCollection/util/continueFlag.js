const {channelWhitelist} = require("../data.config.json");

function continueFlag(message) {
    let continueFunc = false;

    if (!message || !message.author || !message.channelId) return continueFunc; // Ensure message and its properties exist
    if (message.author.bot) return continueFunc;

    for (const channelID of channelWhitelist) {
        if (message.channelId.toString() === channelID) continueFunc = true;
    }

    return continueFunc;
}

module.exports = continueFlag;