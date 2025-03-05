import client, { Channel, Connection } from "amqplib"
import { createLogger } from "./logger";
const rabbitMQLogger = createLogger('Queue');

let pubChannel: Channel | null = null;
let subChannel: Channel | null = null;
let connected = false;
const { AMQP_CONNECTION_STRING, AMQP_EXCHANGE_NAME } = process.env;
const exchange = AMQP_EXCHANGE_NAME  || "/games/admin";
const connectionString = AMQP_CONNECTION_STRING || "amqp://prashant:GpLK982qXJPUMxetvEnzHy@13.200.181.150:5672";

export const initQueue = async() => {
    await connect();
}

export const connect = async() => {
    if (connected && pubChannel && subChannel) return;
    try {
        rabbitMQLogger.info("⌛️ Connecting to Rabbit-MQ Server", connectionString.split('@')[1]);
        const connection = await client.connect(connectionString);
        rabbitMQLogger.info("✅ Rabbit MQ Connection is ready");
        [pubChannel, subChannel] = await Promise.all([
            connection.createChannel(),
            connection.createChannel()
        ]);
        await pubChannel.assertExchange(exchange, "x-delayed-message", { autoDelete: false, durable: true,  
            arguments: { "x-delayed-type": "direct" } });    
        pubChannel.removeAllListeners('close');
        pubChannel.removeAllListeners('error');
        subChannel.removeAllListeners('close');
        subChannel.removeAllListeners('error');
        pubChannel.on('close', async () => { console.error("pubChannel Closed"); pubChannel = null; connected = false; });
        subChannel.on('close', async () => { console.error("subChannel Closed"); subChannel = null; connected = false; setTimeout(()=>initQueue(),1000)});
        pubChannel.on('error', async (msg) => { console.error("pubChannel Error", msg); });
        subChannel.on('error', async (msg) => { console.error("subChannel Error", msg); });
        rabbitMQLogger.info("🛸 Created RabbitMQ Channel successfully");
        connected = true;
    } catch (error) {
        rabbitMQLogger.error(error);
        rabbitMQLogger.error("Not connected to MQ Server");
    }
}

export const sendToQueue = async(ex:string, queueName:string, message:string, delay = 0, retries = 0): Promise<void> => {
    try {
        if (!pubChannel) {
            await connect();
        }
        await pubChannel?.assertQueue(queueName, { durable: true });
        await pubChannel?.bindQueue(queueName, exchange, queueName); // This is done for simplicity .
        pubChannel?.publish(exchange, queueName, Buffer.from(message), {
            headers: { "x-delay": delay, "x-retries": retries }, persistent: true
        });
        console.log(`Message sent to ${queueName} queue on exchange ${exchange}`);
    } catch (error:any) {
        console.log(error);
        rabbitMQLogger.error(`Failed to send message to ${queueName} queue on exchange ${exchange}: ${error.message}`);
        throw error;
    }
}