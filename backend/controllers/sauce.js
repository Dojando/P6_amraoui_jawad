const Sauce = require('../models/Sauce.js');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { request } = require('http');

exports.createThing = (req, res, next) => {
  const regexText = /^[A-Z0-9 .'"_,()àâãäåæçèéêëìíîïðñòóôõøùúûüýÿ!?-]{1,500}$/i;
  const sauceObject = JSON.parse(req.body.sauce);

  let nameValue = regexText.test(sauceObject.name);
  let manufacturerValue = regexText.test(sauceObject.manufacturer);
  let descriptionValue = regexText.test(sauceObject.description);
  let pepperValue = regexText.test(sauceObject.mainPepper);

  if ((nameValue == true) && (manufacturerValue == true) && (descriptionValue == true) && (pepperValue == true)) {
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
      .catch(error => res.status(500).json({ error }));
  } else {
    return res.status(400).json({ message: 'les champs sont invalides' })
  }
};

exports.getOneThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyThing = (req, res, next) => {
  // verification de l'id de l'utilisateur connecté
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'tUUmO1TPYO8MHOGQwt8QiW8T5IDoSW-wuN8kLEvE1J5-zHAGuNGDgT26sCWdrPKcyy_Q8XTuXjP0wkdw18SFFJ--c1vWoZf1zzjgpJOyffCfUu2N-kCjEpyzpsIC6E-5Oyfuu28r9TT0JMtN_-kblIplyNjNKBxoLcptQ6P4jFk');
  const userId = decodedToken.userId;

  // récuperation des infos de la sauce
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    // vérification entre l'id de l'utilisateur connecté et celui de la sauce
    if (userId == sauceObject.userId) {
      const regexText = /^[A-Z0-9 .'"_,()àâãäåæçèéêëìíîïðñòóôõøùúûüýÿ!?-]{1,500}$/i;
  
      let nameValue = regexText.test(sauceObject.name);
      let manufacturerValue = regexText.test(sauceObject.manufacturer);
      let descriptionValue = regexText.test(sauceObject.description);
      let pepperValue = regexText.test(sauceObject.mainPepper);
    
      if ((nameValue == true) && (manufacturerValue == true) && (descriptionValue == true) && (pepperValue == true)) {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié !'}))
          .catch(error => res.status(500).json({ error }));      
      } else {
        return res.status(400).json({ message: 'les champs sont invalides' })
      }
    } else {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier la sauce' })
    }
};

exports.deleteThing = (req, res, next) => {
  // verification de l'id de l'utilisateur connecté
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'tUUmO1TPYO8MHOGQwt8QiW8T5IDoSW-wuN8kLEvE1J5-zHAGuNGDgT26sCWdrPKcyy_Q8XTuXjP0wkdw18SFFJ--c1vWoZf1zzjgpJOyffCfUu2N-kCjEpyzpsIC6E-5Oyfuu28r9TT0JMtN_-kblIplyNjNKBxoLcptQ6P4jFk');
  const userId = decodedToken.userId;

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // vérification entre l'id de l'utilisateur connecté et celui de la sauce
      if (userId == sauce.userId) {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        return res.status(400).json({ message: 'Vous ne pouvez pas supprimer la sauce' })
      }
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
    // le like est accepté si le userId n'est pas dans le tableau usersLiked
    if ((req.body.like == 1) && (sauce.usersLiked.indexOf(req.body.userId) == -1)) {
      sauce.likes += 1;
      sauce.usersLiked.push(req.body.userId);
      sauce = {
        "likes": sauce.likes,
        "usersLiked": sauce.usersLiked
      }
    }

    // le dislike est accepté si le userId n'est pas dans le tableau usersDisliked
    if ((req.body.like == -1) && (sauce.usersDisliked.indexOf(req.body.userId) == -1)) {
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

    Sauce.updateOne({ _id: req.params.id }, { $set: {...sauce} })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(500).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
}