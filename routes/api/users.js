const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
//const passport = require("../../config/passport");
const passport = require("passport");
//const  JWT = require("jsonwebtoken");


// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/user");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
 // Form validation
const { errors, isValid } = validateRegisterInput(req.body);
// Check validation
 if (!isValid) {
   return res.status(400).json(errors);
 }
User.findOne({ email: req.body.email }).then(user => {
   if (user) {
     return res.status(400).json({ email: "Email already exists" });
   } else {
     const newUser = new User({
       name: req.body.name,
       email: req.body.email,
       password: req.body.password
     });
// Hash password before saving in database
     bcrypt.genSalt(10, (err, salt) => {
       bcrypt.hash(newUser.password, salt, (err, hash) => {
         if (err) throw err;
         newUser.password = hash;
         newUser
           .save()
           .then(user => res.json(user))
           .catch(err => console.log(err));
       });
     });
   }
 });
});
// @route POST api/users/login
// @desc Login user and return   token
// @access Public
router.post("/login", (req, res) => {
 // Form validation
const { errors, isValid } = validateLoginInput(req.body);
// Check validation
 if (!isValid) {
   return res.status(400).json(errors);
 }
const email = req.body.email;
 const password = req.body.password;

// Find user by email
 User.findOne({ email }).then(user => {
   // Check if user exists
   if (!user) {
     return res.status(404).json({ emailnotfound: "Email not found" });
   }
// Check password
   bcrypt.compare(password, user.password).then(isMatch => {
     if (isMatch) {
       // User matched
       // Create JWT Payload
       const payload = {
         id: user.id,
         name: user.name
       };
// Sign token
       jwt.sign(
         payload,
         keys.secretOrKey,
         {
           expiresIn: 31556926 // 1 year in seconds
         },
         (err, token) => {
           res.json({
             success: true,
             token: "Bearer " + token
           });
         }
       );
     } else {
       return res
         .status(400)
         .json({ passwordincorrect: "Password incorrect" });
     }
   });
 });
});


var indexController = require("../../controller/index");
//Route to import all the top articles from newyork times
router.get("/ny-article",passport.authenticate('jwt', { session: false }),indexController.getNycArticle);
//Route to get all the article from mongo db
router.get("/article/get-all",indexController.getAllArticle);
//Route to delete particular article from mongo db
router.delete("/article",indexController.deleteArticle);
//Route to create article in mongo db
router.post("/article",indexController.createArticle);
//Route to update a particular article
router.put("/article/:id",indexController.updateArticle);
//Route to search article b title
router.get("/article/search",indexController.searchArticle);

module.exports = router;

