const fs = require("fs")
const path = require("path")
const {v4: uuid} = require("uuid")
const User = require('../models/userModel')
const HttpError = require("../models/errorModel")
const Post = require('../models/postModel')
const { where } = require("sequelize")



//=====Creation de post=========
//post :api/posts

  const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;
        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Veuillez remplir tous les champs et choisir un fichier (PDF ou Word)"));
        }

        const { file } = req.files;

        // Vérifier le type de fichier
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.mimetype)) {
            return next(new HttpError("Seuls les fichiers PDF et Word sont autorisés", 422));
        }

        // Vérifier la taille du fichier (ajustez la limite selon vos besoins)
        if (file.size > 10000000) { // 10 Mo = 10 000 000 octets
            return next(new HttpError("Le fichier est trop volumineux. Il doit faire moins de 10 Mo", 422));
        }

      let fileName = file.name;
      let splittedFilename = fileName.split('.');
      let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];
  
      file.mv(path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
        if (err) {
          return next(new HttpError(err));
        } else {
           // Créer le nouveau post
        const newPost = await Post.create({
            title,
            category,
            description,
            file: newFilename, // Utilisez 'file' pour stocker le nom du fichier
            creator: req.user.id
        });
        
          if (!newPost) {
            return next(new HttpError("Post couldn't be created", 422));
          }
         // Trouver l'utilisateur et augmenter le compteur de posts de 1
         const currentUser = await User.findByPk(req.user.id); // Utilisez findByPk pour les identifiants primaires
         const userPostCount = currentUser.posts + 1;
         
         await User.update({ posts: userPostCount }, {
             where: {
                 id: req.user.id
             }
         });
  
          res.status(201).json(newPost);
        }
      });

        // ... (reste du code inchangé)
    } catch (error) {
        return next(new HttpError(error));
    }
};

/* const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;
        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose image"));
        }

        const { sary } = req.files;

        // Vérifier la taille du fichier
        if (sary.size > 2000000) {
            return next(new HttpError("Image too big. File should be less than 2mb", 422));
        }
        
        let fileName = sary.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];
        
        sary.mv(path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err));
            } else {
                // Créer le nouveau post
                const newPost = await Post.create({
                    title,
                    category,
                    description,
                    sary: newFilename,
                    creator: req.user.id
                });
                
                if (!newPost) {
                    return next(new HttpError("Post couldn't be created", 422));
                }

                // Trouver l'utilisateur et augmenter le compteur de posts de 1
                const currentUser = await User.findByPk(req.user.id); // Utilisez findByPk pour les identifiants primaires
                const userPostCount = currentUser.posts + 1;
                
                await User.update({ posts: userPostCount }, {
                    where: {
                        id: req.user.id
                    }
                });
                
                res.status(201).json(newPost);
            }
        });
    } catch (error) {
        return next(new HttpError(error));
    }
}; */


//=====Get post=========
//Get :api/posts

const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.findAll(); // Récupérer les posts
        const sortedPosts = posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Trier les posts par updatedAt
        res.status(200).json(sortedPosts); // Envoyer les posts triés au client
    } catch (error) {
        return next(new HttpError(error));
    }
}


//=====Get single post=========
//Get :api/posts/:id

const getPost = async (req, res, next) => {
    try{
        const postId = req.params.id;
        const post = await Post.findOne({where:{id: postId}})
        if(!post){
            return next(new HttpError("Post not found", 404))
        }
        res.status(200).json(post)
    }
    catch(error){
        return next(new HttpError(error))
    }
}

//=====get post par category=========
//get :api/posts/categories/:category

const getCatPosts = async (req, res, next) => {
    try {
        const {category} = req.params;
        const catPost = await Post.findAll({where: {category: category}}); // Récupérer les posts
        const sortedPosts = catPost.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Trier les posts par updatedAt
        res.status(200).json(sortedPosts); // Envoyer les posts triés au client
    } catch (error) {
        return next(new HttpError(error));
    }

}

//=====Get user/author Post=========
//Get :api/posts/users/:id

const getUserPosts = async (req, res, next) => {
     try{
        
        const {id} = req.params;
        const userPost = await Post.findAll({where: {creator: id}}); // Récupérer les posts
        const sortedUserPosts = userPost.sort((a, b) => new Date(b.createdAt ) - new Date(a.createdAt )); // Trier les posts par updatedAt
        res.status(200).json(sortedUserPosts); // Envoyer les posts triés au client
     }catch(error){
        return next(new HttpError(error))
     }
}

//=====Edit post=========
//PATCH :api/posts/:id
const editPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let { title, category, description } = req.body;

        if (!title || !category || !(description.length >= 12)) {
            return next(new HttpError("Fill in all fields", 422));
        }

        const oldPost = await Post.findOne({ where: { id: postId } });
        if (!oldPost) {
            return next(new HttpError("Post not found", 404));
        }

        // Check if a new file is uploaded
        if (req.files) {
            const { file } = req.files;

            // Validate file type (same as createPost)
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.mimetype)) {
                return next(new HttpError("Seuls les fichiers PDF et Word sont autorisés", 422));
            }

            // Validate file size (same as createPost)
            if (file.size > 10000000) {
                return next(new HttpError("Le fichier est trop volumineux. Il doit faire moins de 10 Mo", 422));
            }

            // Generate new filename
            let fileName = file.name;
            let splittedFilename = fileName.split('.');
            let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];

            // Delete the old file (if it exists)
            const oldFilePath = path.join(__dirname, '..', '/uploads', oldPost.file);
            fs.unlink(oldFilePath, async (err) => {
                if (err) {
                    console.error("Error deleting old file:", err);
                }

                // Move the new file
                await file.mv(path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
                    if (err) {
                        return next(new HttpError(err));
                    }

                    // Update the post with new data
                    const updatedPost = await oldPost.update({
                        title,
                        category,
                        description,
                        file: newFilename
                    });

                    if (!updatedPost) {
                        return next(new HttpError("Couldn't update post", 400));
                    }

                    res.status(200).json(updatedPost);
                });
            });
        } else {
            // No new file uploaded, update post without file changes
            const updatedPost = await oldPost.update({ title, category, description });
            if (!updatedPost) {
                return next(new HttpError("Couldn't update post", 400));
            }
            res.status(200).json(updatedPost);
        }
  } catch (error) {
    return next(new HttpError(error.message));
  }
};


//=====Delete post=========

const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findOne({ where: { id: postId } });

        // Vérifiez si le post existe
        if (!post) {
            return next(new HttpError("Post unavailable", 400));
        }

        // Vérifiez si l'utilisateur est l'auteur du post
        if (post.creator !== req.user.id) {
            return next(new HttpError("Unauthorized action", 403));
        }

        // Effacez le fichier si nécessaire
        const fileName = post?.file;
        const filePath = path.join(__dirname, '..', 'uploads', fileName);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (!err) {
                // Si le fichier existe, supprimez-le
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                    }
                });
            }
        });

        // Supprimez le post de la base de données
        await Post.destroy({ where: { id: postId } });

        // Mettez à jour le nombre de posts de l'utilisateur
        const currentUser = await User.findOne({ where: { id: req.user.id } });
        const userPostCount = currentUser.posts - 1;
        await User.update({ posts: userPostCount }, { where: { id: req.user.id } });

        res.json(`Post ${postId} deleted successfully`);
    } catch (error) {
        return next(new HttpError(error));
    }
};


  

module.exports = {createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost}