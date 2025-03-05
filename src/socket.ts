import { Server, Socket } from "socket.io";
import { getUserDataFromSource } from "./module/players/playerData";
import { setCache,deleteCache } from "./utilities/redis-connection";
import { registerEvents } from "./router/event-routes";

export const initSocket = (io:Server)=>{
    const onConnection = async(socket:Socket)=>{
        const token =socket.handshake.query.token as string;
        const game_id = socket.handshake.query.game_id as string;
        if (!token) {
            socket.disconnect(true);
            return console.log("No Token Provided", token);
        }
    
        const userData = await getUserDataFromSource(token, game_id);
        socket.data["userInfo"] = userData;
        if (!userData) {
            console.log("Invalid token", token);
            return socket.disconnect(true);
        }
        socket.emit("message", {
            action: "info",
            msg: {
                userId: userData.userId,
                userName: userData.name,
                operator_id: userData.operatorId,
                balance: Number(userData.balance).toFixed(2),
                avatarIndex: userData.image,
            },
        });
        await setCache(
            `PL:${userData.userId}:${userData.operatorId}`,
            JSON.stringify({ ...userData, socketId: socket.id }),
            3600
          );
          registerEvents(io, socket);
        socket.on("disconnect", async () => {
             await deleteCache(`PL:${userData.userId}:${userData.operatorId}`);
        });
        socket.on("error", (error) => {
            console.error(`Socket error: ${socket.id}. Error: ${error.message}`);
        });
}
 io.on("connection", onConnection);
}