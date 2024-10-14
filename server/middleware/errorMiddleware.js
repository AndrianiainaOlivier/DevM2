// //unsupported (404) routes
// const notFound = (req, res, next) => {
//     const error = new Error(`Not found - ${req.originalUrl}`);
//     res.status(404);
//     next(error);
// };

// //Middleware to handle Errors
// const errorHandler = (error, req, res, next) => {
//     if(res.headerSent) {
//         return next(error);
//     }

//     res.status(error.status || 500).json({message: error.message || "Unknow error"});
// };

// module.exports = {notFound, errorHandler};reiryezefh


const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Middleware to handle Errors
const errorHandler = (err, req, res, next) => { // Assurez-vous d'avoir "err" comme premier paramètre
    if (res.headersSent) {
        return next(err); // Utilisez "err" ici
    }
    res.status(err.status || 500).json({ message: err.message || "Unknown error" });
};

module.exports = { notFound, errorHandler };
