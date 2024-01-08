const express = require("express");
const { client, ObjectId } = require("../../services/database.service");

async function getLocations(req, res) {
  try {
    await client.connect();
    const database = client.db("Shop");
    const collection = database.collection("locations");

    const result = await collection.find({}).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
}

async function getLocationsById(req, res) {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db("Shop");
    const collection = database.collection("locations");

    const result = await collection
      .find({ _id: new ObjectId(eventId) })
      .toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
}

module.exports = function () {
    const router = express.Router();

    router.get("/", getLocations);
    router.get("/:eventId", getLocationsById);

    return router;
}