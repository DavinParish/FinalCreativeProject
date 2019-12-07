const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

//
// Ideas
//

const ideaSchema = new mongoose.Schema({
  name: String,
  about: String,
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
    name: req.body.name,
    about: req.body.about,
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

module.exports = router;