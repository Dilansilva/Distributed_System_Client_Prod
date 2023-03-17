const { Socket } = require('socket.io');

const io = require('socket.io')(8000,{
    cors:{
        origin: ['http://localhost:3000']
    }
})

let masterClient = null;
const minionCients = [];
let balance = []
io.on("connection", socket => {
    if(masterClient === null){//if there is no master client
        masterClient = socket.id;//create a master client
        io.to(masterClient).emit("role","MASTERCLIENT");
    } else {//if there is a master client
        minionCients.push(socket.id)//created a minion client
    }

    socket.broadcast.to(socket.id).emit("role","MINIONCLIENT");//pass message to other clients the role
    socket.broadcast.to(masterClient).emit("minionClientsList",minionCients)

    socket.on("selectedMinionClient",message => {//send messages
        if(message === "ALL"){//if user select ALL the minion clients
            if(minionCients.length > 0){
                for(var i = 0; i < minionCients.length ; i++){
                    io.to(minionCients[i]).emit("requestMessage","REQUESTMESSAGE");
                }
            }
        } else {
            io.to(message).emit("requestMessage","REQUESTMESSAGE");
        }
    })

    socket.on("sendTheBalance",message => {//recievc=ved the balance
        balance.push(message)
        let totalBalance = 0
        for(let j = 0 ; j < balance.length ; j++){
            totalBalance = totalBalance + parseInt(balance[j])
        }
        io.to(masterClient).emit("totalBalance",totalBalance);
    })

    socket.on('disconnect',(message) => {
        const index = minionCients.indexOf(socket.id)
        if(index > -1){
            minionCients.splice(index,1)
        } else {
            masterClient = null
        }
        socket.broadcast.to(masterClient).emit("minionClientsList",minionCients)
    })
});