const logger = require("../logger")("voucherService.js");
const { stringify } = require("flatted");
const { Utils } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const VoucherEntity = require("../voucherEntity");
class VoucherService {
    constructor({ databaseConnection, rmqClient, orderService }) {
        this.databaseConnection = databaseConnection;
        this.rmqClient = rmqClient;
        this.orderService = orderService;
        this.voucherEntity = VoucherEntity({
            databaseConnection: databaseConnection.getConnection(),
        });
        this.listenerName = "VOUCHER_QUEUE";
        this.createBindings();
    }

    createBindings() {
        this.listVouchers = this.listVouchers.bind(this);
        this.start = this.start.bind(this);
        this.processVoucher = this.processVoucher.bind(this);
        this.onErrorCallback = this.onErrorCallback.bind(this);
    }

    async listVouchers(req, res) {
        const FUNCTION_NAME = "listVouchers";
        const list = await this.voucherEntity.findAll();
        Utils.createResponse(res, { list });
        logger.info("(%s) - Vouchers list called.", FUNCTION_NAME);
    }

    async start() {
        const FUNCTION_NAME = "start";
        logger.info("(%s) - Starting Listener", FUNCTION_NAME);

        try {
            const listenerParams = {
                queueNameToListenTo: this.listenerName,
                onItemReceiveCallback: this.processVoucher,
                onErrorCallback: this.onErrorCallback,
            };

            await this.rmqClient.addListener(listenerParams);

            logger.info("(%s) - Listener Started Successfully", FUNCTION_NAME);
        } catch (e) {
            logger.error(
                "(%s) - Listener Starting Failed. Error=[%o]",
                FUNCTION_NAME,
                e
            );
        }
    }

    async processVoucher(queueItem) {
        const FUNCTION_NAME = "createVoucher";
        try {
            const { orderId, userId, amount } = JSON.parse(
                queueItem.content.toString()
            );
            Utils.validateFieldsForEmptiness([
                { orderId },
                { userId },
                { amount },
            ]);
            Utils.validateIntegerFields([{ orderId }, { userId }]);
            Utils.validateMoneyFields([{ amount }]);
            const code = uuidv4();
            const decimalPart = amount % 1;
            if (decimalPart === 0.25) {
                throw new Error("Voucher cannot be created.");
            }
            let hasVoucher = false;
            if (amount >= 100) {
                const createInfo = await this.voucherEntity.create({
                    orderId: orderId,
                    userId: userId,
                    value: 5,
                    code: code,
                });
                logger.info(
                    "(%s) - Voucher created - info=[%o]",
                    FUNCTION_NAME,
                    stringify(createInfo)
                );
                hasVoucher = true;
            }
            await this.rmqClient.sendAcknowledgement({
                queueNameToListenTo: this.listenerName,
                queueItem,
                success: true,
            });

            await this.orderService.updateOrder({ orderId, hasVoucher });
            logger.info(
                "(%s) - Order id=[%i] voucher status updated.",
                FUNCTION_NAME,
                orderId
            );
        } catch (e) {
            const errorInfo = e.toString();
            logger.error(
                "(%s) - Failed while creating voucher - error=[%o]",
                FUNCTION_NAME,
                errorInfo
            );
            await this.rmqClient.sendAcknowledgement({
                queueNameToListenTo: this.listenerName,
                queueItem,
                success: true,
            });
        }
    }

    onErrorCallback(e) {
        const FUNCTION_NAME = "onErrorCallback";
        logger.error("(%s) - Error received. Error=[%o]", FUNCTION_NAME, e);
    }
}
module.exports = {
    VoucherService,
};
