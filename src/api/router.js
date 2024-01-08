const express = require("express");
const getRouters = require("./routers");
const geolib = require("geolib");

const { client } = require("../services/database.service");

module.exports = (app) => {

  const router = express.Router();
  router.use("/", getRouters());
  return router;

};
