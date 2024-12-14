// @ts-nocheck
const { Server } = require('socket.io');
const io = require('socket.io-client');

const KnxController = require('../app/controllers/Api/KnxController.js');

const SocketIo = {}

/**
 * * Initial Socket connection
 * @param {*} server 
 */
exports.connection = (server) => {
    const io = new Server('', {
        cors: {origin: "*"}
    }).listen(server);
   
    io.on('connection', (socket)=> {
        console.log(`New Client with id: ${socket.id} connected to secket!`)
    })

    SocketIo.io = io;
}

/**
 * * Start socket event
 * @param {*} name 
 * @param {*} args 
 */
exports.socketEvent = (name, args) => {
    SocketIo.io.emit(name, args);
}

/**
 * * Socket Connection with backend system
 */
exports.socketCommunicationChannel = () => {
    const cc_socket = io(`${process.env.PROTOCOL}${process.env.SOCKET_BACK}`);

    cc_socket.on('connect', () => {
        console.log(`Connected to: ${process.env.SOCKET_BACK}'`);
        console.log(`Socket ID: ${cc_socket.id}`);
        
        cc_socket.on(`${process.env.SOCKET_BACK}_facilities`, (obj)=>{
           if (JSON.parse(obj).action == 'knx_change') {
                console.log('Restarting KNX hook connection...')
                KnxController.startBroadcast();
           }
        });
    })
}