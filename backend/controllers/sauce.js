const Sauce = require('../models/Sauce.js');
const fs = require('fs');
const { request } = require('http');

exports.createThing = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [], 
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyThing = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllStuff = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.likeThing = (req, res, next) => {
  let index;
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    console.log(sauce);
    if (req.body.like == 1) {
      console.log("(egal a 1) " + req.body.like);
      sauce.likes += 1;
      sauce.usersLiked.push(req.body.userId);
      sauce = {
        "likes": sauce.likes,
        "usersLiked": sauce.usersLiked
      }
    }
        
    if (req.body.like == -1) {
      console.log("(egal a -1) " + req.body.like);
      sauce.dislikes += 1;
      sauce.usersDisliked.push(req.body.userId);
      sauce = {
        "dislikes": sauce.dislikes,
        "usersDisliked": sauce.usersDisliked
      }
    }
    
    if (req.body.like == 0) {
      index = sauce.usersLiked.indexOf(req.body.userId);
      if (index > -1) {
        sauce.likes -= 1;
        sauce.usersLiked.splice(index, 1);
        sauce = {
          "likes": sauce.likes,
          "usersLiked": sauce.usersLiked
        }
      }
      else if (sauce.usersDisliked.indexOf(req.body.userId) > -1) {
        index = sauce.usersDisliked.indexOf(req.body.userId);
        sauce.dislikes -= 1;
        sauce.usersDisliked.splice(index, 1);
        sauce = {
          "dislikes": sauce.dislikes,
          "usersDisliked": sauce.usersDisliked
        }
      }
    }

    console.log("(juste avant la reponse )" + req.body.like);
    console.log(sauce);
    Sauce.updateOne({ _id: req.params.id }, { $set: {...sauce} })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(500).json({ error }));
    console.log('sauce.name');
  })
  .catch(error => res.status(400).json({ error }));
}


  // regex element de formulaire (titre, description, mot de passe et email pour que ce soit valide)
  // object sauce pour les like et dislike