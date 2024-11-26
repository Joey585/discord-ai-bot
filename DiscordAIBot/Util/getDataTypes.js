async function getDataTypes(messageArr) {
    let eventLog = []

    for (const message of messageArr) {
        if (message.content.length > 0) eventLog.push({type: "MESSAGE", data: message});
        if (message.attachments.size > 0) eventLog.push({type: "IMAGE", data: message});
        if (message.reactions.cache.size > 0) {
            const reactions = message.reactions.cache;
            for (const [emoji, messageReaction] of reactions) {
                const usersReacted = await messageReaction.users.fetch();
                for (const user of usersReacted) {
                    eventLog.push({type: "REACTION", data: {messageReaction, user}})
                }
            }
        }
    }

    return eventLog;
}

module.exports = getDataTypes;