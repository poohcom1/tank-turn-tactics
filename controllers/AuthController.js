const { hashPassword } = require("../libs/password_utils.js");
const User = require("../models/UserModel.js");


module.exports.register = function (req, res) {
    const { email, password } = req.body;

    hashPassword(password)
        .then(saltHash => {
            const user = new User({
                email: email,
                hash: saltHash.hash,
                salt: saltHash.salt
            })

            console.log(user)

            user.save()
                .then(() => res.redirect('/'))
                .catch(err => {
                    console.log(err)
                    res.redirect(`/register?error=true`)
                })
        })
        .catch(err => res.redirect(`/register?error=true`))
}

module.exports.logout = function (req, res) {
    req.logout()
    res.redirect('/login')
}