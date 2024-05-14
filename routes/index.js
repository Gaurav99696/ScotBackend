const userRoutes = require('./user.routes')

function initRoutes(app) {
    app.use("/api/users", userRoutes);
};

module.exports = initRoutes