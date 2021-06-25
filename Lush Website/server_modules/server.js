const express = require("express");
const app = express();
const session = require("express-session");
const fileUpload = require("express-fileupload");

// Routes configuration
app.use("/public", express.static("public"));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  }),
  express.json({
    limit: "1mb",
  }),
  express.urlencoded({
    extended: true,
  }),
  fileUpload({
    createParentPath: true,
  })
);

const mysql2 = require("mysql2");
require("dotenv/config");

// Database configuration
const connection = mysql2.createConnection({
  host: process.env.HOST,
  port: process.env.DB_PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

module.exports = { app, connection };
