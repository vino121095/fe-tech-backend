// AddToCartModel.js
const { Sequelize } = require('sequelize');
const {DataTypes} = Sequelize;
const sequelize = require('../config/db');
const User = require('./Usermodel');
const Products = require('./Productmodel');

const AddToCart = sequelize.define('AddToCart', {
  cid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: 'add_to_cart',
  timestamps: true,
});

// Associations
User.hasMany(AddToCart, { foreignKey: 'user_id', as: 'cartItems', sourceKey: 'uid' });
AddToCart.belongsTo(User, { foreignKey: 'user_id', as: 'user', targetKey : 'uid' });
AddToCart.belongsTo(Products, { foreignKey: 'product_id', as: 'product', targetKey: 'product_id'});

module.exports = AddToCart;
