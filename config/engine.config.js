/**
 * * View engine initialize
 */
module.exports = (app) => {
    app.set('view engine', 'ejs');
	app.set('views', 'public/');
}