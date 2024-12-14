import express, { Application } from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';

import Route from "./routes/api.routes.js";
import ErrorHandler from "./app/helpers/error-handler.helper.js";
import KnX from './config/knx.config.js';

class App {
    private readonly app!: Application;
    private readonly port!: number;
    private readonly knx!: any;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || "3000");
        this.knx = KnX;
        this.init();
    }

    private init() {
        this.initConfig();
        this.initMiddlewares();
        this.initHeaders();
        this.initRoutes();
        this.initErrorHandling();
    }

    private initConfig() {
        this.knx.connection("172.0.0.1", 3671);
    }

    private initMiddlewares() {
        this.app.use(cookieParser());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initHeaders() {
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader(
                'Access-Control-Allow-Methods',
                'OPTIONS, GET, POST, PUT, PATCH, DELETE'
            );
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        })
    }

    private initRoutes() {
        this.app.use("/api/v1", Route);
    }

    private initErrorHandling() {
        this.app.use(ErrorHandler.notFound);
        this.app.use(ErrorHandler.serverError);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}

export default App;