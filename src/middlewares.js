const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");

const corsConfig = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  headers: {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
    "Access-Control-Allow-Credentials": true,
  },
  credentials: true,
};

const sessionConfig = {
  name: "ticketswift",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 30 * 60 * 1000, httpOnly: true },
  rolling: true,
};

module.exports = (app) => {
  app.use(cors(corsConfig));
  app.use(session(sessionConfig));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(cookieParser());
};
