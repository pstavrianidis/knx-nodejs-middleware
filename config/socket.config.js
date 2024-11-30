import { Server } from 'socket.io'
import io from 'socket.io-client'

import KnxController from'../app/controllers/Api/KnxController.js';

const SocketIo = {}

/**
 * * Initial Socket connection
 * @param {*} server 
 */
SocketIo.connection = (server) => {
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
SocketIo.event = (name, args) => {
    SocketIo.io.emit(name, args);
}

/**
 * * Socket Connection with OCG backend
 */
SocketIo.OCGsocket = () => {
    const ocg_socket = io(`${process.env.PROTOCOL}${process.env.SOCKET_OCG}`);

    ocg_socket.on('connect', () => {
        console.log(`Connected to: ${process.env.SOCKET_OCG}'`);
        console.log(`Socket ID: ${ocg_socket.id}`);
        
        ocg_socket.on(`${process.env.SOCKET_OCG}_facilities`, (obj)=>{
           if (JSON.parse(obj).action == 'knx_change') {
                console.log('Restarting KNX hook connection...')
                KnxController.startBroadcast();
           }
        });
    })
}

export default SocketIo;