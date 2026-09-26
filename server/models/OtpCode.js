const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class OtpCode extends Model {}

OtpCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM('registration', 'login', 'password_reset'),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'OtpCode',
    tableName: 'otp_codes',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = OtpCode;
