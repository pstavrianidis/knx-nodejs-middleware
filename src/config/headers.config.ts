import { Application } from "express";

/**
 * * Request Headers
 */
 export default (app: Application) => {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader(
			'Access-Control-Allow-Methods',
			'OPTIONS, GET, POST, PUT, PATCH, DELETE'
		);
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		next();
    });
}