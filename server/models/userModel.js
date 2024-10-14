const {DataTypes } = require('sequelize');
const sequelize = require('../database');



// Définir le modèle User
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // required: true en Mongoose
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false // required: true en Mongoose
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true // champ optionnel
    },
    posts: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // default: 0 en Mongoose
    }
}, {
    // Options supplémentaires (facultatif)
    tableName: 'users', // nom de la table dans la base de données
    timestamps: true, // si vous souhaitez utiliser `createdAt` et `updatedAt`
});

// Synchroniser le modèle avec la base de données
sequelize.sync()
    .then(() => {
        console.log('La table Users a été créée');
    })
    .catch(error => console.error('Erreur lors de la création de la table :', error));

module.exports = User;





/* const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    avatar: {type: String},
    posts: {type: Number, default: 0}
})

module.exports = model('User', userSchema)

 */