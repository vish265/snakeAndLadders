import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import {createServer} from "http"
import { initSocket } from './src/socket';
import { initializeRedis } from './src/utilities/redis-connection';
import { checkDatabaseConnection } from './src/utilities/db-connection';
import { createLogger } from './src/utilities/logger';
import { connect } from './src/utilities/amqp';

const logger = createLogger("Server");

const startServer = async()=>{
    await Promise.all([checkDatabaseConnection(),initializeRedis(),connect()]);
    const app = express();
app.use(cors());
let server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})
initSocket(io);
app.use(express.json());
dotenv.config()
const PORT = process.env.PORT || 8000;

app.get('/',(req,res)=>{
    res.send("hello")
})

server.listen(PORT,()=>{
    logger.info(`server started at port: ${PORT}`);
})
}

startServer();
