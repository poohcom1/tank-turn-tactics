const bcrypt = require('bcrypt')

const saltRounds = 10;

/**
 *
 * @param password
 * @return {Promise<{salt: *, hash: *}>}
 */
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt)

    return {
        salt: salt,
        hash: hash
    }
}

/**
 * Checks if a password is equal to the given salt and hash
 * @param password
 * @param hash
 * @param salt
 * @return {Promise<boolean>}
 */
async function validPassword(password, hash, salt) {
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword === hash;
}

module.exports.hashPassword = hashPassword;
module.exports.validPassword = validPassword;