import Koa from "koa";
import http from "node:http";
import { Server } from "socket.io";
import serve from "koa-static";

const app = new Koa();
const httpServer = http.createServer(app.callback());
app.use(serve('./frontend'));

const SIZE = 48;
let field = new Array(SIZE * SIZE).fill("#fff");
const io = new Server(httpServer, { cors: { origin: "*" } });
const gameIo = io.of("/game");
const chatIo = io.of("/chat");

gameIo.on("connection", (socket) => {
    socket.emit("NEW_VALUE", field);

    socket.on("UPDATE_VALUE", ({ index, color }) => {
        field[index] = color;
        socket.broadcast.emit("NEW_VALUE", field);
    })
});

chatIo.on("connection", (socket) => {

});


httpServer.listen(3001, () => {
    console.log("started on 3001");
})
