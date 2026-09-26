const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    referral_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    referred_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    credit_balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_recharged: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    level: {
      type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
      defaultValue: 'bronze',
    },
    signup_bonus_multiplied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bonus_deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_banned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
);

module.exports = User;
