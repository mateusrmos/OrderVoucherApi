const { stringify } = require("flatted");
const {
    keys,
    values,
    isEmpty,
    toString,
    forEach,
    isInteger,
} = require("lodash");
const authenticationKey =
    "5Xm)E4e;n1XU?W8q|G&`q2DnTK,{06<A3;QQP5Vx*w2n8@AVLFzS8P;.T(.#";

const logger = require("../logger")("utils.js");

const validateFieldsForEmptiness = (fieldsToValidate = []) => {
    const FUNCTION_NAME = "validateFieldsForEmptiness";

    logger.debug(
        "(%s) - fieldsToValidate=[%o]",
        FUNCTION_NAME,
        fieldsToValidate
    );
    forEach(fieldsToValidate, (field) => {
        const key = keys(field)[0];
        const value = values(field)[0];
        if (isEmpty(toString(value))) {
            throw new Error(`Malformed request. ${key} cannot be empty.`);
        }
    });
};

const isTokenValid = (token) => {
    const FUNCTION_NAME = "isTokenValid";
    try {
        const tokenIsValid = token === authenticationKey;
        return tokenIsValid;
    } catch (e) {
        logger.error("(%s) - Could not determine. Error: %o", FUNCTION_NAME, e);
        return false;
    }
};

const printRequestLog = (fName, logs, req) => {
    if (logs) {
        const requestData = [
            "[Token validation]",
            `x-real-ip ${req.headers["x-real-ip"]} - originalUrl ${req.originalUrl}`,
            `req.protocol ${req.protocol}`,
            `req.hostname ${req.hostname}`,
            `x-forwarded-for ${req.headers["x-forwarded-for"]}`,
            `req.connection.remoteAddress ${
                req.connection ? req.connection.remoteAddress : ""
            }`,
            `req.path ${req.path}`,
            `req.subomains ${req.subomains}`,
            `req.method ${req.method}`,
            `user-agent ${req.header("user-agent")}`,
            `req.headers.host ${req.headers.host}`,
            `req.hostname ${req.hostname}`,
            `cookies ${stringify(req.cookies)}`,
            `Request: ${stringify(req)}`,
        ];
        logger.debug("(%s) - sucess request=[%o]", fName, requestData);
    }
};

const securityWrapper = (
    handler,
    config = { validateToken: true, logs: false }
) => {
    const FUNCTION_NAME = "securityWrapper";

    const { validateToken = true, logs = false } = config;
    return async (req, res, next) => {
        try {
            printRequestLog(FUNCTION_NAME, logs, req);
            const token = req.headers["authkey"] || '';
            if (validateToken && !isTokenValid(token)) {
                createResponse(res, null, "Authentication error", 401);
                logger.error(
                    "(%s) - token_validation_ERROR - token=[%o]",
                    FUNCTION_NAME,
                    token,
                );
            } else {
                logger.debug(
                    "(%s) - Servicing request=[%s]",
                    FUNCTION_NAME,
                    stringify(req.method)
                );
                handler(req, res, next);
            }
        } catch (e) {
            logger.error(
                "(%s) - e=[%o], request=[%s]",
                FUNCTION_NAME,
                e,
                stringify(req)
            );
        }
    };
};

const createResponse = (res, data = null, error = null, code = 200) => {
    const FUNCTION_NAME = "createResponse";
    const response = {
        data,
        error,
    };
    res.status(code).json(response).end();
    logger.debug("(%s) - request response=[%o]", FUNCTION_NAME, response);
};

const validateIntegerFields = (fieldsToValidate = []) => {
    const FUNCTION_NAME = "validateIntegerFields";

    logger.debug(
        "(%s) - fieldsToValidate=[%o]",
        FUNCTION_NAME,
        fieldsToValidate
    );
    forEach(fieldsToValidate, (field) => {
        const key = keys(field)[0];
        const value = values(field)[0];
        if (isInteger(value) === false) {
            throw new Error(
                `Malformed request. ${key} is not a integer value.`
            );
        }
    });
};

const validateMoneyFields = (fieldsToValidate = []) => {
    const FUNCTION_NAME = "validateMoneyFields";

    logger.debug(
        "(%s) - fieldsToValidate=[%o]",
        FUNCTION_NAME,
        fieldsToValidate
    );
    forEach(fieldsToValidate, (field) => {
        const key = keys(field)[0];
        const value = values(field)[0];
        if (/^[0-9]+(\.[0-9]{1,2})?$/.test(value) === false) {
            throw new Error(`Malformed request. ${key} is not a money value.`);
        }
    });
};

const timer = ms => new Promise(res => setTimeout(res, ms));

const Utils = {
    securityWrapper,
    validateFieldsForEmptiness,
    createResponse,
    validateIntegerFields,
    validateMoneyFields,
    timer,
};

module.exports = {
    Utils,
};
