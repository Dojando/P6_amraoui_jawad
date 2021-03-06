const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.signup = (req, res, next) => {
  const email = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]){2,4}$/;
  const pwd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,20}$/;
  let emailValue = email.test(req.body.email);
  let pwdValue = pwd.test(req.body.password);
  if ((emailValue == true) && (pwdValue == true)) {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    return res.status(400).json({ message: 'Email ou mot de passe invalide' });
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'tUUmO1TPYO8MHOGQwt8QiW8T5IDoSW-wuN8kLEvE1J5-zHAGuNGDgT26sCWdrPKcyy_Q8XTuXjP0wkdw18SFFJ--c1vWoZf1zzjgpJOyffCfUu2N-kCjEpyzpsIC6E-5Oyfuu28r9TT0JMtN_-kblIplyNjNKBxoLcptQ6P4jFk',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};