const express = require("express");
const { client, ObjectId, getDbLocations } = require("../../services/database.service");


async function getLocations(req, res) {
  try {
    res.status(200).json(await getDbLocations());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getLocationsById(req, res) {
  const eventId = req.params.eventId;
  try {
    res.status(200).json(await getDbLocations({ _id: new ObjectId(eventId) }));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = function () {
    const router = express.Router();

    router.get("/", getLocations);
    router.get("/:eventId", getLocationsById);

    return router;
}