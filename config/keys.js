require('dotenv').config()
var DBurl = process.env.MONGOLAB_URL;
module.exports = {
 mongoURI: DBurl,
 secretOrKey: "secret"
};