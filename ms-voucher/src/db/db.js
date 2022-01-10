const { Sequelize } = require("sequelize");
const { Utils } = require("../utils");
const logger = require("../logger")("db.js");
const VoucherEntity = require("../voucherEntity");

class DatabaseConnection {
    constructor({ dbUser, dbPass, dbHost, dbPort, dbName }) {
        const connString = `mysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
        this.conn = new Sequelize(connString);
        this.initialize = this.initialize.bind(this);
        this.close = this.close.bind(this);
        this.getConnection = this.getConnection.bind(this);
    }

    async initialize() {
        let maxAttempts = 3;
        let currentAttempt = 0;
        for (
            currentAttempt = 1;
            currentAttempt <= maxAttempts;
            currentAttempt++
        ) {
            try {
                const FUNCTION_NAME = "initialize";
                await this.conn.authenticate();
                VoucherEntity({ databaseConnection: this.getConnection() });
                await this.conn.sync();
                logger.info(
                    "(%s) - Database connection created",
                    FUNCTION_NAME
                );
                break;
            } catch (e) {
                if (currentAttempt === 3) {
                    throw e;
                }
                await Utils.timer(2000);
            }
        }
    }

    async close() {
        const FUNCTION_NAME = "close";
        await this.conn.close();
        logger.info("(%s) - Database connection closed", FUNCTION_NAME);
    }

    getConnection() {
        return this.conn;
    }
}
module.exports = { DatabaseConnection };
