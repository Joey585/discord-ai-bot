const userModel = require("../schema/user");

function replaceSlices(originalString, replacements) {
    let result = originalString;
    replacements.sort((a, b) => a.index - b.index);
    let offset = 0;

    for (const { index, length, replacement } of replacements) {
        result =
            result.slice(0, index + offset) +
            replacement +
            result.slice(index + offset + length);
        offset += replacement.length - length;
    }

    return result;
}


async function cleanText(message, client) {
    const messageContent = message.content;

    const discordRegex = /<(#|@[!&]?)(\d{17,})>/g;
    const matches = [...messageContent.matchAll(discordRegex)];

    let replacements = []

    for (const match of matches) {
        switch (match[1]) {
            case "@":
                const user = await userModel.findOne({id: match[2]});
                replacements.push({
                    index: match.index,
                    length: match[0].length,
                    replacement: user ? `@user${user.uid}` : "@unkown-user"
                })
                break;
            case "#":
                const channel = await client.channels.fetch(match[2]);
                if (!channel) break;
                replacements.push({
                    index: match.index,
                    length: match[0].length,
                    replacement: `#${channel.name}`
                });
                break;
            case "@&":
                const role = await message.guild.roles.fetch(match[2])
                if (!role) break;
                replacements.push({
                    index: match.index,
                    length: match[0].length,
                    replacement: `@${role.name}`
                });
                break;
        }
    }
    return replaceSlices(messageContent, replacements).replaceAll("\n", "<LB>");
}

module.exports = cleanText;