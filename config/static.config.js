var path=require('path');

/**
 * * Initial puplic directories
*/
module.exports = (app, express) => {
	app.use('/storage', express.static('storage'));
};