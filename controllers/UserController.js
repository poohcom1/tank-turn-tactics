const User = require('../models/UserModel.js')


module.exports.getUser = function (req, res) {
    res.send(req.user.id)
}