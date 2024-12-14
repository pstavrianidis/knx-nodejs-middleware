import { Connection } from "knx";

class KnX {
  /**
   * * Connect to Knx
   * @param address 
   * @param port 
   * @returns 
   */
  static connection(address: string, port: number) {
    try {
      return new Connection({
        ipAddr: (address),
        ipPort: (port),
        minimumDelay: 50,
        debug: true,
        handlers: {
          connected: () => {
            console.info('**** Starting Broadcasting *****');
            console.info(`${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} - [info] KNX: successfully connected ${address}:${port}`);
          },
          event: (evt, src, dest, value) => {
            console.log("%s - [info] KNX EVENT: %j, src: %j, dest: %j, value: %j",
              new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
              evt, src, dest, value);
  
            //? Convert hex buffer object
            let objString = JSON.stringify(new Buffer(value));
            let objhex = JSON.parse(objString).data[0];
  
            //todo Socket handle
          },
          error: (connstatus) => {
            console.log("**** ERROR: %j", connstatus);
          }
        }
      })
    } catch (error) {
      throw error;
    }
  }
}

export default KnX;
