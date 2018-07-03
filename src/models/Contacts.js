/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Contacts', {
    User_ID: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    User_First_Name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_Last_Name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_Email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_Website: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_Company: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_Phone: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    User_Address: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    User_City: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_State: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    User_Zip: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    }
  }, {
    tableName: 'Contacts'
  });
};
