const User = require('../models/UserModel.js')

/**
 * Creates and stores a user
 * @param email
 * @param username
 * @param hash
 * @param salt
 * @param admin
 * @return {Promise<Document<any, any, unknown>>}
 */
module.exports.createUser = function (email, username, hash, salt, admin=false) {
    const user = new User({
        email,
        username,
        hash,
        salt,
        admin
    })

    return user.save();
}
