/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Contact_Hubspot_Response', {
    Response_ID: {
      type: DataTypes.INTEGER(12),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    User_ID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Hubspot_VID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Response_JSON: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'Contact_Hubspot_Response'
  });
};
