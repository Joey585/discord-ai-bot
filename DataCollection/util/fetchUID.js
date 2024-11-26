const userModel = require("../schema/user");
const logger = require("./logger");

async function fetchUID(userObj) {
    let uid = null;
    let createdNew = false;
    const user = await userModel.findOne({id: userObj.id.toString()});
    if (!user) {
        uid = (await userModel.countDocuments()) + 1

        if (!uid) return logger.error("Could not count the database documents for UID!")

        await userModel.create({
            id: userObj.id.toString(),
            username: userObj.username,
            uid,
            messages: 1
        });

        logger.debug(`Added new document for ${userObj.username}`);

        createdNew = true;
    } else {
        uid = user.uid;
    }

    return {uid, createdNew};
}

module.exports = fetchUID;