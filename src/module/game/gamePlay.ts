import { Server, Socket } from "socket.io";
import { getCache } from "../../utilities/redis-connection";
import { generateUUIDv7 } from "../../utilities/common-function";

let roomId: string;
let playerCount: number = 0;
let joinTimer: NodeJS.Timeout | null = null;
let roomOpenTime: number = 0; // Timestamp for when the first player joins
const MAX_PLAYERS = 4;
const WAIT_TIME = 60000; // 1 minute in milliseconds
const HOLD_TIME = 60000; // Time players will be held in waiting state before joining the room (60 seconds)

export const joinRoom = async (io: Server, socket: Socket) => {
    const cachedPlayerDetails = await getCache(
        `PL:${socket.data.userInfo.userId}:${socket.data.userInfo.operatorId}`
    );

    if (!cachedPlayerDetails)
        return socket.emit("message", {
            action: "joinError",
            message: "No user found.",
        });

    let playerDetails = JSON.parse(cachedPlayerDetails);

    // If roomId is not set, create a new room
    if (!roomId) {
        roomId = generateUUIDv7();
        roomOpenTime = Date.now(); // Store the time when the first player joins
        playerCount = 0; // Initialize player count
    }

    // Check if the player is trying to join before the hold time (60 seconds)
    if (Date.now() - roomOpenTime < HOLD_TIME) {
        return socket.emit("message", {
            action: "joinError",
            message: "Please wait, the room is still in waiting mode.",
        });
    }

    // If the room has been open for more than 1 minute and has less than MAX_PLAYERS, let others join
    if (Date.now() - roomOpenTime > WAIT_TIME) {
        return socket.emit("message", {
            action: "joinError",
            message: "Room session expired. No more players can join.",
        });
    }

    // If the room already has 4 players, prevent joining
    if (playerCount >= MAX_PLAYERS) {
        return socket.emit("message", {
            action: "joinError",
            message: "Room is full. Max 4 players are allowed.",
        });
    }

    // Join the room
    socket.join(roomId);
    playerCount++;

    // Send a message to the room with the current player count
    io.to(roomId).emit("message", {
        action: "playerJoined",
        message: `Player ${socket.data.userInfo.userId} joined the room.`,
        playerCount: playerCount,
    });

    // If 4 players are in the room, send a message that the game can begin
    if (playerCount === MAX_PLAYERS) {
        io.to(roomId).emit("message", {
            action: "gameStart",
            message: "The room is full. The game can now start!",
        });
        // You can start the game logic here if you want to.
    }
};

// To reset the room and allow a new round of players:
export const resetRoom = () => {
    roomId = ''; // Reset the roomId
    playerCount = 0; // Reset player count
    roomOpenTime = 0; // Reset the timestamp for when the first player joined
};
