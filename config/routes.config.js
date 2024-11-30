const api = require('../routes/api');

/**
 * * Initial Routes
 */
 module.exports = (app) => {
    app.use('/api/v1', api);
}