const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Referral extends Model {}

Referral.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    referrer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referred_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired'),
      defaultValue: 'pending',
    },
    credits_awarded: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Referral',
    tableName: 'referrals',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Referral;
