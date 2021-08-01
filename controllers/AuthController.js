const { hashPassword } = require("../libs/password_utils.js");
const User = require("../models/UserModel.js");

async function createUser(email, password, admin=false) {
    const saltHash = await hashPassword(password);

    return await new User({
        email: email,
        hash: saltHash.hash,
        salt: saltHash.salt,
        admin
    }).save()
}

module.exports.register = function (req, res) {
    const { email, password } = req.body;

    createUser(email, password)
        .then(() => res.redirect('/'))
        .catch(err => {
            console.log(err)
            res.redirect(`/register?error=true`)
        })
}

module.exports.logout = function (req, res) {
    req.logout()
    res.redirect('/login')
}

module.exports.createUser = createUser;