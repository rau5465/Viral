const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class UserSpin extends Model {}

UserSpin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reward_credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    segment_label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    slice_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ad_session_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserSpin',
    tableName: 'user_spins',
    underscored: true,
    timestamps: true,
    updatedAt: false, // only need created_at
  }
);

module.exports = UserSpin;
