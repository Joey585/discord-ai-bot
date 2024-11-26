const userModel = require("../schema/user");

async function fetchUID(userObj) {
    let uid = null;
    let createdNew = false;

    const discordUserID = userObj.id ?? userObj[0].toString();
    const discordUsername = userObj.username ?? userObj[1].username

    const user = await userModel.findOne({id:  discordUserID});
    if (!user) {
        uid = (await userModel.countDocuments()) + 1

        if (!uid) return console.error("Could not count the database documents for UID!")

        await userModel.create({
            id: discordUserID,
            username: discordUsername,
            uid,
            messages: 1
        });


        createdNew = true;
    } else {
        uid = user.uid;
    }

    return {uid, createdNew};
}

module.exports = fetchUID;