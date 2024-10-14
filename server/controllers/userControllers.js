const bcrypt = require('bcrypt')
const fs = require("fs")
const path = require("path")
const {v4: uuid} = require("uuid")
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const HttpError = require("../models/errorModel")


const registerUser = async(req, res, next) => {
    try {
        const {name, email, password, password2} = req.body;
        if(!name || !email || !password) {
            return next(new HttpError("Tous les champs doivent rempli", 422))
        }

        const newEmail = email.toLowerCase()

        const emailExists = await User.findOne({where: {email: newEmail}})
        if(emailExists) {
            return next(new HttpError("Email deja existe", 422))
        }

        if((password.trim()).length < 6) {
            return next(new HttpError("Mot de passe doit composé 6 caracteur au moin", 422))
        }

        if(password != password2) {
            return next(new HttpError("Password do not match", 422))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({name, email: newEmail, password: hashedPass})
        res.status(201).json(`New user ${newUser.email} register `)



    }catch (error) {
        return next(new HttpError("Enregistrement echoué", 422))
    }
}
//===login user==
//Post : api/users/login
const loginUser = async(req, res, next) => {
   try{
       const {email, password} = req.body;
       if(!email || !password){
        return next(new HttpError("Tous les champs doit rempli", 422))
       }
       const newEmail = email.toLowerCase();

       const user = await User.findOne({ where: { email: newEmail } })
       if(!user){
        return next(new HttpError("Adresse email incorrect", 422))
       }

       const comparePass = await bcrypt.compare(password, user.password)
       if(!comparePass){
        return next(new HttpError("Mot de passe incorrect", 422))
       }

       const {id: id, name} = user;
       const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

       res.status(200).json({token, id, name})
   }catch (error){
    return next(new HttpError("Login failed", 422))
   }
}

//===Profil user==
//Post : api/users/:id
const getUser = async(req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({
            where: { id: id },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return next(new HttpError("User not found", 404));
        }
        res.status(200).json(user);
  }catch(error){
     return next(new HttpError(error))
  }

}

//===Changer photo de profil==
//Post : api/users/change-avatar
const changeAvatar = async (req, res, next) => {
    try {
      if (!req.files.avatar) {
        return next(new HttpError("Choisir image", 422));
      }
      
      // find user from database
      const user = await User.findOne({ where: { id: req.user.id } });
  
      // delete old avatar if exists
      if (user.avatar) {
        fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
          if (err) {
            return next(new HttpError(err));
          }
        });
      }
      
      const { avatar } = req.files;
  
      // check file size
      if (avatar.size > 500000) {
        return next(new HttpError("Profile picture too big. Should be less than 500kb", 422));
      }
  
      let fileName;
      fileName = avatar.name;
      let splittedFilename = fileName.split('.');
      let newFilename = `${splittedFilename[0]}_${uuid()}.${splittedFilename[splittedFilename.length - 1]}`;
      
      avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
        if (err) {
          return next(new HttpError(err));
        }
  
        const [updatedRowCount, updatedRows] = await User.update(
          { avatar: newFilename },
          { where: { id: req.user.id }, returning: true }
        );
  
        if (updatedRowCount === 0) {
          return next(new HttpError("Avatar couldn't be changed", 422));
        }

         // Récupérer les informations complètes de l'utilisateur y compris le nouvel avatar
            const updatedUser = await User.findOne({ where: { id: req.user.id }, attributes: { exclude: ['password'] } });

            res.status(200).json(updatedUser); // Retourner l'objet utilisateur mis à jour
  
        /* res.status(200).json(updatedRows[0]); */
      });
    } catch (error) {
      return next(new HttpError(error));
    }
  };
  

//===MODIFIER  DETAILS  USER==
//Post : api/users/edit-user
const editUser = async (req, res, next) => {
  try {
      const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
      
      // Vérifiez que tous les champs requis sont remplis
      if (!name || !email || !currentPassword || !newPassword) {
          return next(new HttpError("Remplissez tous les champs", 422));
      }

      // Récupérez l'utilisateur de la base de données
      const user = await User.findOne({ where: { id: req.user.id } });
      if (!user) {
          return next(new HttpError("Utilisateur non trouvé", 403));
      }

      // Vérification si l'email existe déjà
      const emailExist = await User.findOne({ where: { email } });
      if (emailExist && (emailExist.id !== req.user.id)) {
          return next(new HttpError("Email déjà existant", 422));
      }

      // Comparez le currentPassword avec le mot de passe de la base de données
      const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validateUserPassword) {
          return next(new HttpError("Mot de passe actuel invalide", 422));
      }

      // Comparez le nouveau mot de passe
      if (newPassword !== confirmNewPassword) {
          return next(new HttpError("Les nouveaux mots de passe ne correspondent pas", 422));
      }

      // Hachez le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Mettez à jour les informations de l'utilisateur dans la base de données
      const newInfo = await User.update(
          { name, email, password: hashedPassword },
          { where: { id: req.user.id }, returning: true }
      );
      
      res.status(200).json(newInfo[1]); // newInfo[1] contiendra les données mises à jour
  } catch (error) {
      return next(new HttpError(error.message || "Erreur lors de la mise à jour de l'utilisateur", 500));
  }
};


//===GET AUTHORS==
//Post : api/users/authors
const getAuthors = async (req, res, next) => {
    try {
        const authors = await User.findAll({
            attributes: { exclude: ['password'] } // Exclure le mot de passe
        });
        res.json(authors);
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}
