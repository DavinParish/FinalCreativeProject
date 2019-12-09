const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const auth = require("./auth.js");

const SALT_WORK_FACTOR = 10;

//
// Users
//

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  skills: [],
  tokens: [],
});

userSchema.pre('save', async function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password'))
    return next();

  try {
    // generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);

    // hash the password along with our new salt
    const hash = await bcrypt.hash(this.password, salt);

    // override the plaintext password with the hashed one
    this.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userSchema.methods.comparePassword = async function(password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (error) {
    return false;
  }
};

userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  delete obj.tokens;
  return obj;
}

userSchema.methods.addToken = function(token) {
  this.tokens.push(token);
}

userSchema.methods.removeToken = function(token) {
  this.tokens = this.tokens.filter(t => t != token);
}

userSchema.methods.removeOldTokens = function() {
  this.tokens = auth.removeOldTokens(this.tokens);
}


const User = mongoose.model('User', userSchema);


// create a new user
router.post('/', async (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).send({
      message: "username and password are required"
    });


  try {

    //  check to see if username already exists
    const existingUser = await User.findOne({
      username: req.body.username
    });
    if (existingUser)
      return res.status(403).send({
        message: "username already exists"
      });

  // create new user
  // create new user
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
    await user.save();
    login(user, res);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});



// login
router.post('/login', async (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    //  lookup user record
    const existingUser = await User.findOne({
      username: req.body.username
    });
    if (!existingUser)
      return res.status(403).send({
        message: "username or password is wrong"
    });

    // check password
    if (!await existingUser.comparePassword(req.body.password))
      return res.status(403).send({
        message: "username or password is wrong"
      });

    login(existingUser, res);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

async function login(user, res) {
  let token = auth.generateToken({
    id: user._id
  }, "24h");

  user.removeOldTokens();
  user.addToken(token);
  await user.save();

  return res
    .cookie("token", token, {
      expires: new Date(Date.now() + 86400 * 1000)
    })
    .status(200).send(user);
}


// Logout
router.delete("/", auth.verifyToken, async (req, res) => {
  // look up user account
  const user = await User.findOne({
    _id: req.user_id
  });
  if (!user)
    return res.clearCookie('token').status(403).send({
      error: "must login"
    });

  user.removeToken(req.token);
  await user.save();
  res.clearCookie('token');
  res.sendStatus(200);
});


// Get current user if logged in.
router.get('/', auth.verifyToken, async (req, res) => {
  // look up user account
  const user = await User.findOne({
    _id: req.user_id
  });
  if (!user)
    return res.status(403).send({
      error: "must login"
    });
  return res.send(user);
});


// Get user List
router.get('/userList', auth.verifyToken, async (req, res) => {
  const userList = await User.find();
  return res.send(userList);
});

// add skill
router.post('/skill', async (req, res) => {
  const existingUser = await User.findOne({
      username: req.body.user.username
    });
  existingUser.skills.push(req.body.skill);
  existingUser.save();
  return res.sendStatus(200);
  
});


// delete a skill
router.delete('/skill/:username/:skill', async (req, res) => {
  const existingUser = await User.findOne({
      // username: req.body.user.username
      username: req.params.username
    });
  
  existingUser.skills.splice(existingUser.skills.indexOf(req.params.skill), 1 );
  existingUser.save();
  return res.sendStatus(200);
  
});


// edit email
router.post('/editEmail', async (req, res) => {
  const currentUser = await User.findOne({
      username: req.body.user,
      email: req.body.email,
    });
  currentUser.email =  req.body.email; 
  currentUser.save();
  return res.sendStatus(200);
  
});

// // Get email
// router.get('/:supporter', auth.verifyToken, async (req, res) => {
//   // look up user account
//   const user = await User.findOne({
//     name: req.params.supporter
//   });
  
//   // console.log("CURRENT USER");
//   // console.log(user);
  
//   return res.send(user.email);
// });

// delete a user
router.delete('/:id', auth.verifyToken, async (req, res) => {
  try {
    await User.deleteOne({
      _id: req.params.id
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

module.exports = router;