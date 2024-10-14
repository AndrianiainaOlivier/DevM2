const express = require('express');
const cors = require('cors');
const sequelize = require('./database'); 
require('dotenv').config();
const upload = require('express-fileupload');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(upload());
app.use('/uploads', express.static(__dirname + '/uploads'))

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

// Établir la connexion avec la base de données
sequelize.authenticate()
  .then(() => {
    console.log('Connexion réussie à MariaDB');
    // Démarrer le serveur uniquement après la connexion à la base de données
    app.listen(process.env.PORT || 8080, () => console.log(`Serveur démarré sur le port ${process.env.PORT}`));
  })
  .catch((error) => {
    console.error('Erreur lors de la connexion à MariaDB :', error);
  });










// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const {notFound, errorHandler} = require('./middleware/errorMiddleware');

// const app = express();



// app.use(express.json({extended: true}));
// app.use(express.urlencoded({extended: true}));
// app.use(cors({credentials: true, origin: "http://localhost:3000"}));


// app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes);

// app.use(notFound);
// app.use(errorHandler);

// app.listen(8080, () => console.log("Server ranning on port 8080"));



// const express = require('express');
// const cors = require('cors');
// const { connect } = require('mongoose');
// require('dotenv').config();

// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// const app = express();
// app.use(express.json({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Ajoutez ":" après "http"

// app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes);

// // Utilisez les middlewares pour gérer les erreurs
// app.use(notFound);
// app.use(errorHandler);

// app.listen(8080, () => console.log("Server running on port 8080"));

/* 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();  // Charger les variables d'environnement

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

// Obtenir l'URI de MongoDB à partir du fichier .env
const mongoURI = process.env.MONGO_URI;

// Établir la connexion avec MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connexion réussie à MongoDB');
    // Démarrer le serveur uniquement après la connexion à MongoDB
    app.listen(8080, () => console.log("Serveur démarré sur le port 8080"));
  })
  .catch((error) => {
    console.error('Erreur lors de la connexion à MongoDB :', error);
  }); */
