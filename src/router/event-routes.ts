import { Server, Socket } from "socket.io";

export const registerEvents = async (io:Server, socket:Socket) => {
  socket.on("action", (data:string) => {
    const event = data.split(":");
    switch (event[0]) {
      
    }
  });
};
