const express = require('express');
const router = express.Router();

const KnxController = require('../app/controllers/Api/knx.controller');

//* KNX commands
router.post('/middleware-knx-switch', KnxController.knxSwitchRequest);
router.post('/middleware-knx-dimming', KnxController.knxDimmingRequest);
router.post('/middleware-knx-status', KnxController.getStatus);
router.post('/middleware-knx-multi-status', KnxController.multiStatusByIpRouter);

//* Authenticate
// router.post('/authenticate', AuthController.authedicate);

module.exports = router;