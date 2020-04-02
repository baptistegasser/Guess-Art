/**
 * Handle a client socket
 * @param {SocketIO.socket} socket 
 */
const handleConnection = (socket) => {
    console.log('A client connected');
    
    // If the user is not connected close the socket
    if (!socket.request.session.user) {
        console.log('nah, pas de config');
        return;
    }
}

module.exports = handleConnection;