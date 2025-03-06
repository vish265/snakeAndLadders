import { Server, Socket } from "socket.io";
import { joinRoom } from "../module/game/gamePlay";

export const registerEvents = async (io:Server, socket:Socket) => {
  socket.on("action", (data:string) => {
    const event = data.split(":");
    switch (event[0]) {
      case "JN":
        return joinRoom(io, socket);
    }
  });
};
