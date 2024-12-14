import { Router } from "express";
import KnxController from "../app/controllers/Api/knx.controller.js"

class Route {
    private readonly knxController!: KnxController;
    public readonly router!: Router;

    constructor() {
        this.knxController = new KnxController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post("/middleware-knx-switch", this.knxController.knxSwitchRequest.bind(this.knxController));
        this.router.post("/middleware-knx-dimming", this.knxController.knxDimmingRequest.bind(this.knxController));
        this.router.post("/middleware-knx-status", this.knxController.getStatus.bind(this.knxController));
        this.router.post("/middleware-knx-multi-status", this.knxController.multiStatusByIpRouter.bind(this.knxController));
    }
}

export default new Route().router;