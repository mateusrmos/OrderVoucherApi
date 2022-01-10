require("dotenv").config();

const logger = require("./logger")("microservice_runner.js");
const domain = require("domain");
const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const app = express();
const d = domain.create();
const httpServer = http.createServer(app);
const { Routes } = require("./routes");
const { DatabaseConnection } = require("./db");
const { VoucherService } = require("./voucherService");
const { RMQClient } = require("./rmqClient/rmqClient");
const { OrderService } = require("./orderService");

const SERVICE_PORT = process.env.SERVICE_PORT || 5050;
const dbUser = process.env.DATABASE_USER;
const dbPass = process.env.DATABASE_PASSWORD;
const dbHost = process.env.DATABASE_HOST;
const dbPort = process.env.DATABASE_PORT;
const dbName = process.env.DATABASE_NAME;

const rmqHost = process.env.RMQ_HOST;
const rmqPort = process.env.RMQ_PORT;
const rmqUser = process.env.RMQ_USER;
const rmqPwd = process.env.RMQ_PWD;

const apiBaseUrl = process.env.ORDER_API;

const databaseConnection = new DatabaseConnection({
    dbUser,
    dbPass,
    dbHost,
    dbPort,
    dbName,
});
const rmqClient = new RMQClient({ rmqHost, rmqPort, rmqUser, rmqPwd });
const orderService = new OrderService({ apiBaseUrl });
const voucherService = new VoucherService({ rmqClient, databaseConnection, orderService });
const applicationRoutes = new Routes({ voucherService });

app.use(cors());
app.use(bodyParser.json());
app.use("/api/", applicationRoutes.getVoucherRoutes());

d.on("error", async (e) => {
    logger.error("Error: %o", e);
});

process.on("SIGINT", async (data) => {
    await databaseConnection.close();
    await rmqClient.closeConnection();
    logger.info(
        "Cleaning up and exiting Process. Received Signal - [%o]",
        data
    );
    setTimeout(() => {
        logger.info("Exiting - %o", data);
        process.exit(1);
    }, 1000);
});

process.on("uncaughtException", async (data) => {
    logger.info(
        "Cleaning up and exiting Process. Received Signal - [%o]",
        data
    );

    setTimeout(() => {
        logger.info("Shutting down");
        process.exit(1);
    }, 1000);
});

d.run(async () => {
    try {
        await rmqClient.createConnection();
        await databaseConnection.initialize();
        await voucherService.start();
        await httpServer.listen(SERVICE_PORT, "0.0.0.0", () => {
            logger.info("Initialized - ms-voucher on port=[%d].", SERVICE_PORT);
        });
    } catch (e) {
        logger.error("Service Failed. Error: %o", e);
    }
});
