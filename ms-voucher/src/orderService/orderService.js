const axios = require("axios");
const { stringify } = require("flatted");
class OrderService {
    constructor({ apiBaseUrl }) {
        this.apiBaseUrl = apiBaseUrl;
    }

    async updateOrder({ orderId, hasVoucher }) {
        const apiUrl = `${this.apiBaseUrl}/order/${orderId}`;
        return axios.put(
            apiUrl,
            JSON.stringify({
                hasVoucher,
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}
module.exports = { OrderService };
