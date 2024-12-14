import { Application } from 'express';
import routes from '../routes/api.routes.js';

/**
 * * Initial Routes
 */
 export default (app: Application) => {
    app.use('/api/v1', routes);
}