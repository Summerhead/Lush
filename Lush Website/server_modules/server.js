const mysql2 = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const express = require("express");
const app = express();
const server = require("http").createServer(app);

require("dotenv/config");

const connection = mysql2.createConnection({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/public", express.static("public"));

app.use(bodyParser.json());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  fileUpload({
    createParentPath: true,
  })
);

server.listen(5501);

module.exports = { app, connection };
