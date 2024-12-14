import { Application } from "express";

/**
 * * Error request handling
 */
 export default (app: Application) => {
    app.use((error:any, req:any, res:any, next:any) => {
		console.log(error);
		const status = error.statusCode || 500;
		const message = error.message;
		const data = error.data;
		res.status(status).json({ status: status, message: message, data: data });
	});
}