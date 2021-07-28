

module.exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

module.exports.isAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        next()
    } else {
        res.status(401).send()
    }
}