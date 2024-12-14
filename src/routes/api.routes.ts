import { Router } from "express";
import { getStatus, knxDimmingRequest, knxSwitchRequest, multiStatusByIpRouter } from "../app/controllers/Api/knx.controller.js";

const router = Router();

//* KNX commands
router.post('/middleware-knx-switch', knxSwitchRequest);
router.post('/middleware-knx-dimming', knxDimmingRequest);
router.post('/middleware-knx-status', getStatus);
router.post('/middleware-knx-multi-status', multiStatusByIpRouter);


export default router;