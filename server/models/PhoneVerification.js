const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PhoneVerification = sequelize.define(
  'PhoneVerification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    sender_jid: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sender_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'expired', 'used'),
      allowNull: false,
      defaultValue: 'pending',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'phone_verifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['mobile', 'code'],
      },
      {
        fields: ['code', 'status'],
      },
      {
        fields: ['mobile', 'status'],
      },
    ],
  }
);

module.exports = PhoneVerification;
