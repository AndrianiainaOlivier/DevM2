const {DataTypes } = require('sequelize');
const sequelize = require('../database');

// Définition du modèle Post
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM(
            "Agriculture", 
            "Business", 
            "Education", 
            "Uncategorized", 
            "Weather", 
            "Entertainment", 
            "Art", 
            "Investment"
        ),
        allowNull: false,
        // Note : Sequelize ne gère pas la même méthode de validation que Mongoose. Vous pouvez utiliser un validateur pour fournir un message d'erreur.
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // Stocke le chemin du fichier par rapport au répertoire de base
    file: {
        type: DataTypes.STRING,
        allowNull: true // champ optionnel
    },
    creator: {
        type: DataTypes.INTEGER, // Ou DataTypes.STRING, en fonction du type utilisé pour l'ID de l'utilisateur
        references: {
            model: 'users', // Assurez-vous que cela correspond au nom de votre modèle User
            key: 'id'
        }
    },
}, {
    timestamps: true,
});

// Synchronisation du modèle avec la base de données (si nécessaire)
(async () => {
    await sequelize.sync();
})();

// Exportez le modèle
module.exports = Post;
