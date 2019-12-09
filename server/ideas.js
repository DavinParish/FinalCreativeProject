const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
//
// Ideas
//

// app.configure(function(){
//   app.use(express.bodyParser());
//   app.use(app.router);
// });

const ideaSchema = new mongoose.Schema({
  author: String,
  title: String,
  about: String,
  skills: [],
  supporters: [],
});

const Idea = mongoose.model('Idea', ideaSchema);
const auth = require("./auth.js");

router.get('/', async (req, res) => {
  try {
    let ideas = await Idea.find();
    return res.send(ideas);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


router.post('/', async (req, res) => {
  const idea = new Idea({
    author: req.body.username,
    title: req.body.title,
    about: req.body.about,
    skills: req.body.skills,
  });
  try {
    await idea.save();
    return res.send(idea);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.delete('/:id', auth.verifyToken, async (req, res) => {
  try {
    await Idea.deleteOne({
      _id: req.params.id
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// add supporter
router.post('/support', async (req, res) => {
  const currentIdea = await Idea.findOne({
      title: req.body.idea.title
    });
  currentIdea.supporters.push(req.body.user);
  currentIdea.save();
  return res.sendStatus(200);
  
});

router.get('/support/:id', async (req, res) => {
  try {
    const currentIdea = await Idea.findOne({
      _id: req.params.id
    });
    return res.send(currentIdea.supporters);
  }catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.delete('/support/:ideaTitle/:supporter', async (req, res) => {
  try {
    const currentIdea = await Idea.findOne({
      title: req.params.ideaTitle
    });
    currentIdea.supporters.splice(currentIdea.supporters.indexOf(req.params.supporter), 1 );
    currentIdea.save();
    return res.send(currentIdea.supporters);
  }catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// Get the ideas that the ser has made
router.get('/userIdeas/:author', async (req, res) => {
  try {
    const userIdeas = await Idea.find({
      author: req.params.author
    });
    return res.send(userIdeas);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});



module.exports = router;