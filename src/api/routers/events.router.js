const express = require("express");
const geolib = require("geolib");
const { client, ObjectId, getDbEvents, getDbEvent} = require("../../services/database.service");

async function getEvents(req, res) {
  const lat = req.query["lat"];
  const lon = req.query["lon"];
  let radius = req.query["radius"] ?? 100; //Km
  let country = req.query["country"];
  let keyword = req.query["keyword"];
  let genre = req.query["genre"];
  let subgenere = req.query["subgenre"]; 

  //Check if lat and lon are provided
  if ((lat && !lon) || (!lat && lon)) {
    return res
      .status(400)
      .json({ error: "Both lat and lon parameters are required." });
  }

  let query = { 
    ...keyword && {"name": { $regex: new RegExp(keyword, "i")}},
    ...genre && {"genre": { $regex: new RegExp(genre, "i")}},
    ...subgenere && {"subgenere": { $regex: new RegExp(subgenere, "i")}},
  } 
  console.log(query);
  try {
    let result = await getDbEvents(query);


    if (lat && lon) {
      //filter by position
      const userLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };

      result = result.filter((event) => {
        const eventLocation = event["location"];
        const distance = geolib.getDistance(userLocation, eventLocation);
        const distanceInKm = geolib.convertDistance(distance, "km");
        console.log("DISTANCE => " + distanceInKm + " RANGE => " + radius);
        return distanceInKm <= parseFloat(radius);
      });

    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getEventById(req, res) {
  const eventId = req.params.eventId;

  try {
    const result = await getDbEvent({ _id: new ObjectId(eventId) });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getTickes(req, res) {
  const eventId = req.params.eventId;

  try {
    const result = await getDbEvents({ _id: new ObjectId(eventId) });
    let first = result[0];
    res.status(200).json(first["tickets"]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = function () {
  const router = express.Router();

  router.get("/", getEvents);
  router.get("/:eventId", getEventById);
  router.get("/:eventId/tickets", getTickes);

  return router;
};
