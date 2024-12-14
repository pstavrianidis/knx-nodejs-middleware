import { Request, Response, NextFunction } from "express";
import { Datapoint } from "knx";
import KnX from "../../../config/knx.config.js";
import axios from "axios";
import Validator from "validatorjs";

class KnxController {
  private connections: Array<any> = [];
  private knx: any;

  constructor() {
    this.knx = KnX;
  }

  /**
   * * Send Command On/Off To KNX Device
   * @param req
   * @param res
   * @param next
   */
  knxSwitchRequest(req: Request, res: Response, next: NextFunction) {
    let value = req.body.value;
    let connection = this.connections.find((con) => con.address == req.body.ip);

    //* Validation Rules
    let rules = {
      ip: "required",
      device: "required",
      value: "required|boolean",
    };

    //* Set Validation
    let validation = new Validator(req.body, rules);

    //* If Validation fails
    if (validation.fails()) {
      const error: any = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = validation.errors.all();
      throw error;
    }

    try {
      let dp = new Datapoint({ ga: req.body.device, dpt: "DPT1" }, connection.boardcast); //? Send connection with router
      dp.write(value); //? Send value

      //* Get Status
      if (!!req.body.status) {
        let dpstatus = new Datapoint({ ga: req.body.status, dpt: "DPT1" }, connection.boardcast);
        dpstatus.read((src, value) => {
          res.status(200).json({ src: src, value: value });
        });
      } else {
        res.status(200).json({ send: "ok" });
      }
    } catch (error: any) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  }

  /**
   * * Send Command Dimming To KNX Device
   * @param req 
   * @param res 
   * @param next 
   */
  knxDimmingRequest(req: Request, res: Response, next: NextFunction) {
    let connection = this.connections.find((con) => con.address == req.body.ip);

    //* Validation Rules
    let rules = {
      ip: "required",
      device: "required",
      dpt: "required",
      dimming: "required",
    };

    //* Set Validation
    let validation = new Validator(req.body, rules);

    //* If Validation fails
    if (validation.fails()) {
      const error: any = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = validation.errors.all();
      throw error;
    }

    try {
        let dp = new Datapoint({ ga: req.body.device, dpt: req.body.dpt },connection.boardcast); //? Send connection with router
        dp.write(req.body.dimming); //? Send value
    
        //* Get Status
        if (!!req.body.status) {
          let dpstatus = new Datapoint({ ga: req.body.status, dpt: req.body.dpt }, connection.boardcast);
          setTimeout(() => {
            dpstatus.read((src, value) => {
                res.status(200).json({ src: src, value: value });
            });
          }, 1100);
        } else {
            res.status(200).json({ send: "ok" });
        }
      } catch (error: any) {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      }
  }

  /**
   * * Get Status of a device
   * @param req 
   * @param res 
   * @param next 
   */
  getStatus(req: Request, res: Response, next: NextFunction) {
    let connection = this.connections.find((con) => con.address == req.body.ip);

    //* Validation Rules
    let rules = {
        ip: "required", //? Router Ip
        status: "required", //? Status address
        dpt: "required", //? Device dpt type
    };

    //* Set Validation
    let validation = new Validator(req.body, rules);

    //* Set Validation
    if (validation.fails()) {
        const error: any = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = validation.errors.all();
        throw error;
    }

    try {
        let dp = new Datapoint({ ga: req.body.status, dpt: req.body.dpt }, connection.boardcast);
        dp.read((src, value) => {
          console.log("KNX response: %j, value: %j", src, value);
          res.status(200).json({ src: src, value: value });
        });
      } catch (error: any) {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      }
  }

  /**
   * * Get Status of all Devices per IP Router
   * @param req 
   * @param res 
   * @param next 
   */
  multiStatusByIpRouter(req: Request, res: Response, next: NextFunction) {
    let connection = this.connections.find((con) => con.address == req.body.ip);
    let devices = req.body.devices;

    //* Validation Rules
    let rules = {
        ip: "required",
        devices: "required",
    };

    //* Set Validation
    let validation = new Validator(req.body, rules);

    //* Set Validation
    if (validation.fails()) {
        const error: any = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = validation.errors.all();
        throw error;
    }

    try {
        let updatedResponse: Array<any> = [];
        devices.forEach((obj: any) => {
          let dp = new Datapoint({ ga: obj.status, dpt: obj.dpt }, connection.boardcast);
          dp.read((src, value) => {
            //console.log("KNX response: %j, value: %j", src, value);
            let resObj = { src: src, value: value };
            updatedResponse.push(resObj);
          });
        });
    
        setTimeout(() => {
            res.status(200).json(updatedResponse);
        }, 1000);

      } catch (error: any) {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      }
  }

  /**
   * * Start Broadcasting Event for IP Routers
   */
  async startBroadcast() {
    try {
        const params = new URLSearchParams();
    
        let res = await axios.post(`${process.env.PROTOCOL}${process.env.DOMAIN}knx/router/list`, params,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        let routers = res.data.routers;
        routers.map(async (con: any) => {
          try {
            let hook = {
              address: con.address,
              port: con.port,
              boardcast: this.knx.connection(con.address, con.port),
            };
    
            this.connections.push(hook);
          } catch (error) {
            throw error;
          }
        });
      } catch (error) {
        throw error;
      }
  }
}

export default KnxController;
