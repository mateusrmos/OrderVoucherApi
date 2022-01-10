const voucherRouter = require('express').Router();

const logger = require('../logger')('routes.js');
const { Utils } = require('../utils');

class Routes {
    constructor({ voucherService }) {
        this.voucherService = voucherService;
        
        this.initVoucherRoutes();
    }

    initVoucherRoutes() {
        const FUNCTION_NAME = 'initVoucherRoutes';
        logger.info('Initializing Voucher Routes Rest APIs', FUNCTION_NAME);
        voucherRouter.get('/vouchers',
            Utils.securityWrapper(this.voucherService.listVouchers));
    }

    getVoucherRoutes() {
        const FUNCTION_NAME = 'getVoucherRoutes';
        logger.info('Fetch Voucher Routes Rest APIs', FUNCTION_NAME);

        return voucherRouter;
    }

}

module.exports = {
    Routes,
};
