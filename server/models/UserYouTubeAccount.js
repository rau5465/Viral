const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class UserYouTubeAccount extends Model {
  // Ensure sensitive OAuth tokens are never leaked in JSON serialization
  toJSON() {
    const values = { ...this.get() };
    delete values.access_token;
    delete values.refresh_token;
    return values;
  }
}

UserYouTubeAccount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    google_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    youtube_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    youtube_channel_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    youtube_channel_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    token_expiry: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_connected: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserYouTubeAccount',
    tableName: 'user_youtube_accounts',
    underscored: true,
    timestamps: true,
  }
);

module.exports = UserYouTubeAccount;
