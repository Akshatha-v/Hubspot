import { mySql } from '../config';
import { env } from '../config'
import Sequelize from 'sequelize';
import fs from 'fs-extra';
import path from 'path';
var db = {
    Sequelize: Sequelize,
    sequelize: new
        Sequelize(mySql.config.database, mySql.config.user, mySql.config.password,
            {
                host: mySql.config.host,
                dialect: mySql.config.dialect,
                port: mySql.config.port,
                define: {
                    timestamps: false
                },
                isolationLevel: "READ COMMITTED" //Initial setting for sequelize transaction
            })
};
db.sequelize
    .authenticate()
    .then(function (err) {
        console.log('Connected to Mysqldb successfully.');
    }, function (err) {
        console.log('Unable to connect to the database:', err);
    });
//Concat all the model files
fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        var model = db.sequelize.import(path.join(__dirname, file));
        if (model.primaryKeyAttributes[0] == 'id')
            model.removeAttribute('id')
        db[model.name] = model;
    });
// export connection
module.exports = db;