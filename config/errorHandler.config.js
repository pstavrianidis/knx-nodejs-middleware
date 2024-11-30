/**
 * * Error request handling
 */
 module.exports = (app) => {
    app.use((error, req, res, next) => {
		console.log(error);
		const status = error.statusCode || 500;
		const message = error.message;
		const data = error.data;
		res.status(status).json({ status: status, message: message, data: data });
	});
}