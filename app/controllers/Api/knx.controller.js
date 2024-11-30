const knx = require('knx');
const KNX = require('../../../config/knx.config.js');
const axios = require('axios');
const Validator = require('validatorjs');


let connections = [];

/**
 * * Send Command On/Off To KNX Device
 * @param {string} ip //? Router Ip
 * @param {string} device //? Device address
 * @param {number} value //? Switch Value (0-off, 1-on)
 * @param {string} status //? Status address (optional)
 */
exports.knxSwitchRequest = (request, response, next) => {
    let value = request.body.value;
    let connection = connections.find(con => con.address == request.body.ip);

    //* Validation Rules
    let rules = {
		ip: 'required',
		device: 'required',
        value: 'required|boolean'
	}

    //* Set Validation
	let validation = new Validator(request.body, rules);

    //* If Validation fails
	if (validation.fails()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = validation.errors.all();
		throw error;
	}

    try {
        let dp = new knx.Datapoint({ga: request.body.device, status_ga: request.body.status, dpt: 'DPT1' }, connection.boardcast); //? Send connection with router
        dp.write(value); //? Send value
        
        //* Get Status
        if (!!request.body.status) {
            let dpstatus = new knx.Datapoint({ga: request.body.status, dpt: 'DPT1'}, connection.boardcast);
            dpstatus.read((src, value) => {
                response.status(200).json({src: src, value: value });
            })
        } else {
            response.status(200).json({send: 'ok'});
        }
        
        
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
   
}

/**
 * * Send Command Dimming To KNX Device
 * @param {string} ip //? Router Ip
 * @param {string} device //? Device address
 * @param {object|number} dimming //? DPT3 {decr_incr, data} | DPT5 [0 … 100]% | DPT1 0/1
 * @param {string} dpt //? type of device
 * @param {string} status //? Status address (optional)
 */
exports.knxDimmingRequest = (request, response, next) => {
    let connection = connections.find(con => con.address == request.body.ip);

    //* Validation Rules
    let rules = {
		ip: 'required',
		device: 'required',
        dpt: 'required',
        dimming: 'required'
	}

    //* Set Validation
	let validation = new Validator(request.body, rules);

    //* If Validation fails
	if (validation.fails()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = validation.errors.all();
		throw error;
	}
    
    try {
        let dp = new knx.Datapoint({ga: request.body.device, status_ga: request.body.status, dpt: request.body.dpt }, connection.boardcast); //? Send connection with router
        dp.write(request.body.dimming); //? Send value

        //* Get Status
        if (!!request.body.status) {
            let dpstatus = new knx.Datapoint({ga: request.body.status, dpt: request.body.dpt}, connection.boardcast);
            setTimeout(() => {
                dpstatus.read((src, value) => {
                    response.status(200).json({src: src, value: value });
                })
            }, 1100)

           
        } else {
            response.status(200).json({send: 'ok'});
        }
        

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

/**
 * * Get Status of a device
 * @param {string} ip //? Router Ip
 * @param {string} status //? Status address
 * @param {string} dpt //? Device dpt type
 */
exports.getStatus = (request, response, next) => {
    let connection = connections.find(con => con.address == request.body.ip);

    //* Validation Rules
    let rules = {
		ip: 'required',
		status: 'required',
        dpt: 'required'
	}

    //* Set Validation
	let validation = new Validator(request.body, rules);

    //* Set Validation
	if (validation.fails()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = validation.errors.all();
		throw error;
	}

    try {
        let dp = new knx.Datapoint({ga: request.body.status, dpt: request.body.dpt}, connection.boardcast);
        dp.read((src, value) => {
            console.log("KNX response: %j, value: %j", src, value);
            response.status(200).json({src: src, value: value});
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

/**
 * * Get Status of all Devices per IP Router
 * @param {string} ip //? Router Ip
 * @param {array} devices //? Array of Devices
 */
exports.multiStatusByIpRouter = (request, response, next) => {
    let connection = connections.find(con => con.address == request.body.ip);
    let devices = request.body.devices;

    
    //* Validation Rules
    let rules = {
		ip: 'required',
		devices: 'required'
	}

    //* Set Validation
	let validation = new Validator(request.body, rules);

    //* Set Validation
	if (validation.fails()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = validation.errors.all();
		throw error;
	}

    try {
        let updatedResponse = [];
        devices.forEach( (obj) => {
            let dp = new knx.Datapoint({ga: obj.status, dpt: obj.dpt}, connection.boardcast);
            dp.read((src, value) => {
                //console.log("KNX response: %j, value: %j", src, value);
                let resObj = {src: src, value: value};
                updatedResponse.push(resObj)
            })
            
        });
        
        setTimeout(() => {
            response.status(200).json(updatedResponse);
        }, 1000)
       
       
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

/**
 * * Start Broadcasting Event for IP Routers
 */
exports.startBroadcast = async () => {
    try {
        const params = new URLSearchParams();
        params.append('pass', 'nF8_hT#!bRw7_Ak6');
        params.append('corporateid', 0);
        
        let res = await axios.post(`${process.env.PROTOCOL}${process.env.DOMAIN}knx/router/list`, params,{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }, 
        });
        let routers = res.data.routers;
        routers.map( async con => {
            try {
                let hook = {
                    "address": con.address,
                    "port": con.port,
                    "boardcast": await KNX.connection(con.address, con.port),
                }

                connections.push(hook);
            } catch (error) {
                throw error;
            }
        })
    } catch (error) {
        throw error;
    }
}