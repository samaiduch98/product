const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mainAdmin=require('./utils');
const cors = require('cors')
const mysql = require("mysql");
const {
   adminToken,
} = mainAdmin

global.db_config = {
   host: "127.0.0.1",
   port: 3306,
   user: "root",
   password: "",
   database: "user_product",
};
var pool = mysql.createPool(db_config);

global.pool = pool;
global.file_upload_path = "C:\/Users\/vanna mok\/Desktop\/product\/data\/";

//Header
app.use(cors())
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "25mb" }));
app.use(
   bodyParser.urlencoded({
      limit: "25mb",
      extended: true,
      parameterLimit: 25000,
   })
);
app.use((req, res, next) => {
   req.header("Access-Control-Allow-Origin", "*");
   req.header("Access-Control-Allow-Credentials", "true");
   req.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
   req.header(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
   );
   res.header("Content-Type", "application/json; charset=utf-8");
   next();
});

const login=require('./api/login');
const user_admin=require('./api/user-admin');
const product=require('./api/product');


app.use('/login',login);
app.use('/users', adminToken, user_admin);
app.use('/products', adminToken, product);

//--- not match route 
app.use((req, res, next) => {
   const error = new Error("Not Found");
   error.status = 404;
   next(error);
});

app.use((error, req, res, next) => {
   console.log('=---- 500', error)
   res.status(error.status || 500);
   res.json({
      error: {
         message: error.message,
      },
   });
});

module.exports = app;



