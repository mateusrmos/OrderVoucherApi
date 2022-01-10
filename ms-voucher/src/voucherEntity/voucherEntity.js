const { Sequelize } = require("sequelize");

const VoucherEntity = ({ databaseConnection }) => {
    return databaseConnection.define('voucher', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        orderId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        value: {
            type: Sequelize.DOUBLE(8, 2),
            allowNull: false,
        },
        code: {
            type: Sequelize.UUID,
            allowNull: false,
        }
    }, {
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['code']
            }
        ]
    }
    );
}
module.exports = VoucherEntity;