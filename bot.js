import botAim from "./bot-aim.js";

export const botStep = (field, socket) => {
    // BOT FOR SOME MAGIC!
    if (JSON.stringify(field) === JSON.stringify(botAim)) return false;

    const index = Math.floor(Math.random() * botAim.length);

    if (botAim[index] === field[index]) return setTimeout(() => botStep(field, socket), 10);

    field[index] = botAim[index];

    socket.emit("UPDATE_VALUE", { index, color: botAim[index] }); // send to current client
    socket.broadcast.emit("UPDATE_VALUE", { index, color: botAim[index] }); // send to others

    return true;
}
