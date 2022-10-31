import Koa from "koa";
import http from "node:http";
import { Server } from "socket.io";
import serve from "koa-static";

const app = new Koa();
const httpServer = http.createServer(app.callback());
const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" } });

let field = null;

app.use(serve('./frontend'));

io.on("connection", (socket) => {
    socket.emit("NEW_VALUE", field);

    socket.on("UPDATE_VALUE", (data) => {
        field = data;
        socket.broadcast.emit("NEW_VALUE", data);
    })
});



httpServer.listen(3001, () => {
    console.log("started on 3001");
})
