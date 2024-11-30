const express = require('express');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const knx = require('./config/knx.config');
const app = express();

app.use(express.json()); // application/json
app.use(cookieParser());
app.use(cors());


//* application/json
app.use(express.json());

//* Set template engine
require('./config/engine.config')(app)

//* Static Files Initial
require('./config/static.config')(app, express);

//* Set headers
require('./config/headers.config')(app);

//* Get routes from core section
require('./config/routes.config')(app);

//* Handler for generic errors
require('./config/errorHandler.config')(app);


//* Connect to db, listen Appliction
try {
	let port = (process.env.LISTEN_PORT || 1234);
	let server = app.listen(port, () => {
		console.log(`Successfully initialized local application on port: ${port}`);
		knx.connection()
	});
} catch (error) {
	throw `An error occurred while trying to initialize the local application: ${error}`;
}
