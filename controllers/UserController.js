const User = require('../models/UserModel.js')

/**
 * Creates and stores a user
 * @param email
 * @param username
 * @param hash
 * @param salt
 * @return {Promise<Document<any, any, unknown>>}
 */
module.exports.createUser = function (email, username, hash, salt) {
    const user = new User({
        email,
        username,
        hash,
        salt
    })

    return user.save();
}
