import Koa from "koa";
import http from "node:http";
import { Server } from "socket.io";
import serve from "koa-static";
import Router from "koa-router"
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import {botStep} from "./bot.js";

const app = new Koa();
const router = new Router();

const httpServer = http.createServer(app.callback());
app.use(cors());
app.use(bodyParser());
app.use(serve('./frontend'));

const SIZE = 48;
let field = new Array(SIZE * SIZE).fill("#fff");
const io = new Server(httpServer, { cors: { origin: "*" } });
const gameIo = io.of("/game");


/** game stuff **/
const startBot = (socket) => {
    const bot = botStep(field, socket);
    return bot && setTimeout(() => startBot(socket), 10);
}

gameIo.on("connection", (socket) => {
    socket.emit("NEW_VALUE", field);

    socket.on("UPDATE_VALUE", ({ index, color }) => {
        field[index] = color;
        socket.broadcast.emit("UPDATE_VALUE", { index, color });
    });

    socket.on("RUN_BOT!", () => {
        startBot(socket);
    })
});
/** game stuff end **/



/** chat stuff **/
let messages = []

router.get('/messages', async (ctx, next) => {
    ctx.res.statusCode = 200;
    ctx.res.end(JSON.stringify(messages));
    await next();
})

let subscribers = [];

router.get('/subscribe', async (ctx, next) => {
    const message = await new Promise((resolve) => {
        subscribers.push(resolve);
    });

    ctx.res.statusCode = 200;
    ctx.res.end(message);

    await next();
});

router.post('/publish', async (ctx, next) => {
    if (ctx.request.body.message) {
        if (ctx.request.body.message === "/reset")  return messages = [];

        messages.push(ctx.request.body.message);

        subscribers.forEach((resolve) => {
            resolve(ctx.request.body.message);
        });

        subscribers = [];
    }

    ctx.res.statusCode = 200;
    ctx.res.end();

    await next();
});
/** chat stuff **/


app.use(router.routes());

httpServer.listen(3001, () => {
    console.log("started on 3001");
})
