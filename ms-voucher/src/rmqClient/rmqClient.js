const amqp = require("amqplib");
const _ = require("lodash");

const logger = require("../logger")("rmqClient.js");
const { Utils } = require("../utils");

class RMQClient {
    constructor({ rmqHost, rmqPort, rmqUser, rmqPwd }) {
        this.conn = null;

        this.RMQ_HOST = rmqHost;
        this.RMQ_PORT = rmqPort;
        this.RMQ_USER = rmqUser;
        this.RMQ_PASSWORD = rmqPwd;

        this.channels = [];
        this.createBindings();
    }

    createBindings() {
        this.createConnection = this.createConnection.bind(this);
        this.onConnectionBlocked = this.onConnectionBlocked.bind(this);
        this.onConnectionUnBlocked = this.onConnectionUnBlocked.bind(this);
        this.onConnectionError = this.onConnectionError.bind(this);
        this.onConnectionClosed = this.onConnectionClosed.bind(this);
        this.addListener = this.addListener.bind(this);
        this.onChannelClosed = this.onChannelClosed.bind(this);
        this.onChannelError = this.onChannelError.bind(this);
        this.closeConnection = this.closeConnection.bind(this);
        this.sendAcknowledgement = this.sendAcknowledgement.bind(this);
    }

    async createConnection() {
        let maxAttempts = 3;
        let currentAttempt = 0;
        for (
            currentAttempt = 1;
            currentAttempt <= maxAttempts;
            currentAttempt++
        ) {
            try {
                const FUNCTION_NAME = "createConnection";

                const connURL = `amqp://${this.RMQ_USER}:${this.RMQ_PASSWORD}@${this.RMQ_HOST}:${this.RMQ_PORT}`;
                const connURLForLogs = `amqp://${this.RMQ_USER}:*****@${this.RMQ_HOST}:${this.RMQ_PORT}`;
                logger.debug(
                    "(%s) - Creating RabbitMQ connection - url=[%s]",
                    FUNCTION_NAME,
                    connURLForLogs
                );

                try {
                    this.conn = null;
                    this.conn = await amqp.connect(connURL);
                    this.conn.on("close", this.onConnectionClosed);
                    this.conn.on("error", this.onConnectionError);
                    this.conn.on("blocked", this.onConnectionBlocked);
                    this.conn.on("unblocked", this.onConnectionUnBlocked);
                    logger.info("(%s) - Connected to rabbitmq", FUNCTION_NAME);
                    break;
                } catch (e) {
                    logger.error("(%s)  - error=[%o]", FUNCTION_NAME, e);
                    throw e;
                }
            } catch (e) {
                if (currentAttempt === maxAttempts) {
                    throw e;
                }
            }
            await Utils.timer(2000);
        }
    }

    async onConnectionBlocked(reason) {
        const FUNCTION_NAME = "onConnectionBlocked";
        logger.debug(
            "(%s)  - Connection was blocked due to reason=[%s].",
            FUNCTION_NAME,
            reason
        );
    }

    async onConnectionUnBlocked() {
        const FUNCTION_NAME = "onConnectionBlocked";
        logger.debug("(%s) - Connection was unblocked.", FUNCTION_NAME);
    }

    async onConnectionError(error) {
        const FUNCTION_NAME = "onConnectionError";
        logger.debug("(%s) - Error:[%s]", FUNCTION_NAME, error);
    }

    async onConnectionClosed() {
        const FUNCTION_NAME = "onConnectionClosed";
        logger.debug(
            "(%s) - Connection was closed due to an error",
            FUNCTION_NAME
        );
    }

    async addListener({
        queueNameToListenTo,
        onItemReceiveCallback,
        onErrorCallback,
        durable = true,
        autoDelete = false,
    }) {
        const FUNCTION_NAME = "addListener";
        logger.debug(
            "(%s) - Recieve Attaching listener for %s",
            FUNCTION_NAME,
            queueNameToListenTo
        );

        try {
            Utils.validateFieldsForEmptiness([queueNameToListenTo]);

            if (!this.conn) {
                throw new Error(
                    "Connection was not established. Please establish a connection"
                );
            }

            if (_.find(this.channels, queueNameToListenTo)) {
                throw new Error("Listener already exist.");
            }

            const channel = await this.conn.createChannel();
            channel.on("close", () =>
                this.onChannelClosed(queueNameToListenTo)
            );
            channel.on("error", (error) =>
                this.onChannelError(error, queueNameToListenTo)
            );

            const response = await channel.assertQueue(queueNameToListenTo, {
                durable,
                autoDelete,
            });
            logger.info(
                "(%s)  - Created Channel and asserted Queue=[%s], Response=[%o]",
                FUNCTION_NAME,
                response
            );

            const channelRef = {
                channel,
                onItemReceiveCallback,
                onErrorCallback,
                durable,
                autoDelete,
            };
            this.channels.push({ [queueNameToListenTo]: channelRef });

            channel.consume(queueNameToListenTo, onItemReceiveCallback);
        } catch (e) {
            logger.error("(%s) - Error=[%o]", FUNCTION_NAME, e);
            if (onErrorCallback) {
                onErrorCallback(e);
            }
        }
    }

    async onChannelClosed(channelName) {
        const FUNCTION_NAME = "onChannelClosed";
        logger.debug(
            "(%s) - Channel (%i) was closed due to an error.",
            FUNCTION_NAME,
            channelName
        );
    }

    async onChannelError(error, channelName) {
        const FUNCTION_NAME = "onChannelError";

        logger.debug(
            "(%s) - Channel (%o) was closed due to an error. error=[%i]",
            FUNCTION_NAME,
            channelName,
            error
        );
    }

    async sendAcknowledgement({
        queueNameToListenTo,
        queueItem,
        success = true,
    }) {
        const channelEntry = _.find(this.channels, queueNameToListenTo);
        if (!channelEntry) {
            throw new Error(
                `Channel=[${queueNameToListenTo}] does not exist. Cannot send acknowledgement`
            );
        }

        if (success === true) {
            channelEntry[queueNameToListenTo].channel.ack(queueItem);
        } else {
            channelEntry[queueNameToListenTo].channel.nack(queueItem);
        }
    }

    async closeConnection() {
        const FUNCTION_NAME = "closeConnection";

        logger.debug("(%s) - Closing RabbitMQ connections", FUNCTION_NAME);

        try {
            if (this.channels && this.channels.length > 0) {
                const clone = Object.assign(this.channels, []);
                this.channels = [];

                _.forEach(clone, async (channel) => {
                    logger.debug(
                        "(%s) - Closing Channel=[%s]",
                        FUNCTION_NAME,
                        Object.keys(channel)[0]
                    );
                    await channel[Object.keys(channel)[0]].channel.close();
                });
            }

            logger.debug("(%s) - Waiting on channels to close", FUNCTION_NAME);

            setTimeout(async () => {
                if (this.conn) {
                    await this.conn.close();
                    this.conn = null;
                }
                logger.debug(
                    "(%s) - Closed RabbitMQ Connections",
                    FUNCTION_NAME
                );
            }, 2000);
        } catch (e) {
            logger.error("(%s) - Error=[%o]", FUNCTION_NAME, e);
        }
    }
}

module.exports = {
    RMQClient,
};
