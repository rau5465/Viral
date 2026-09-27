const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ContactMessage extends Model {}

ContactMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'new',
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ContactMessage',
    tableName: 'contact_messages',
    underscored: true,
    timestamps: true,
  }
);

module.exports = ContactMessage;
