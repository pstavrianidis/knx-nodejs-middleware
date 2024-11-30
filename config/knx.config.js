const knx = require("knx");
// const SocketIo = require('./socket.config');

exports.connection = async (address, port) => {
  try {
    return knx.Connection({
      ipAddr: ('127.0.0.1'),
      ipPort: (3671),
      minimumDelay: 50,
      debug: true,
      handlers: {
        connected: () => {
          console.info('**** Starting Broadcasting *****')
          console.info(`${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} - [info] KNX: successfully connected ${address}:${port}`);
        },
        event: (evt, src, dest, value) => {
          console.log("%s - [info] KNX EVENT: %j, src: %j, dest: %j, value: %j",
            new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            evt, src, dest, value);

          //? Convert hex buffer object
          let objString = JSON.stringify(new Buffer(value));
          let objhex = JSON.parse(objString).data[0];

          SocketIo.event('knxevents', { event: evt, destination: dest, hex: objhex }); //? Send knx event to client
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
