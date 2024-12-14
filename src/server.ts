import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import configHeaders from "./config/headers.config.js";
import configRoutes from "./config/routes.config.js";
import configErrorHandler from "./config/errorHandler.config.js";

import * as knx from './config/knx.config.js';

const app = express();

app.use(express.json()); // application/json
app.use(cookieParser());
app.use(cors());


//* application/json
app.use(express.json());

//* Set headers
configHeaders(app);

//* Get routes from core section
configRoutes(app);

//* Handler for generic errors
configErrorHandler(app);


//* Connect to db, listen Appliction
try {
	let port = (process.env.LISTEN_PORT || 1234);
	let server = app.listen(port, () => {
		console.log(`Successfully initialized local application on port: ${port}`);
		knx.connection("172.0.0.1", 3671);
	});
} catch (error) {
	throw `An error occurred while trying to initialize the local application: ${error}`;
}
