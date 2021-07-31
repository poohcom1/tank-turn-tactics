const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("../models/UserModel.js");
require('../libs/password_utils.js')
const { validPassword } = require("../libs/password_utils.js");

const fieldNames = {
    usernameField: 'email',
    passwordField: 'password'
}

/**
 *
 * @param email
 * @param password
 * @param done Finished callback
 */
function verifyCallback(email, password, done) {
    // Find user in database
    User.findOne({ email: email }, async function (err, user) {
        // If err
        if (err) { console.log("DB Error"); return done(err); }
        // If user not found
        if (!user) {
            console.log("Incorrect username")
            return done(null, false, { message: 'Incorrect username.' });
        }

        validPassword(password, user.hash, user.salt)
            .then(isValid => {
                if (!isValid) {
                    console.log("Incorrect password")
                    return done(null, false, { message: 'Incorrect password.' });
                }

                console.log("Logged in successfully")
                return done(null, user);
            })
            .catch(err => {
                console.log("Password check Error");
                done(err)
            })
    });
}

const strategy = new LocalStrategy(fieldNames, verifyCallback)

passport.use(strategy)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((uid, done) => {
    User.findById(uid)
        .then(user => done(null, user))
        .catch(err => done(err))
})