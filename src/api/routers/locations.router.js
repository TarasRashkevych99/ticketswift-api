const express = require("express");
const { client, ObjectId, getDbLocations } = require("../../services/database.service");
const validationService = require("../../services/validation.service");

async function getLocations(req, res) {
  try {
    res.status(200).json(await getDbLocations());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getLocationsById(req, res) {
  //Zod input validation
  let validation = validationService.idSchema.safeParse(req.params.eventId)
  if(!validation.success)
    return res.status(400).send(validation.error);

  const eventId = req.params.eventId;

  try {
    res.status(200).json(await getDbLocations({ _id: eventId }));
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