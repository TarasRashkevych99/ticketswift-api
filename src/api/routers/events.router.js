async function getEvents(req, res) {
  const lat = req.query["lat"];
  const lon = req.query["lon"];
  let range = req.query["range"] ?? 100; //Km

  //Check if lat and lon are provided
  if ((lat && !lon) || (!lat && lon)) {
    return res
      .status(400)
      .json({ error: "Both lat and lon parameters are required." });
  }
  let v = 0;
  try {
    await client.connect();

    const database = client.db("Shop");
    const collection = database.collection("Events");

    let result = await collection.find({}).toArray();

    if (lat && lon) {
      //Filtra per posizione
      const userLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };

      result = await Promise.all(
        result.map(async (event) => {
          const c2 = database.collection("Locations");
          const r = await c2.find({ _id: event["venueId"] }).toArray();
          first = r[0];
          const eventLocation = first["location"];
          const distance = geolib.getDistance(userLocation, eventLocation);
          const distanceInKm = geolib.convertDistance(distance, "km");
          //console.log("DISTANCE => " + distanceInKm + " RANGE => " + range);
          if (distanceInKm <= parseFloat(range)) return event;
        })
      );
    }
    result = result.filter((event) => event !== undefined);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
}

async function getEventById(req, res) {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db("Shop");
    const collection = database.collection("Events");

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

async function getTickes(req, res) {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db("Shop");
    const collection = database.collection("Events");

    const result = await collection
      .find({ _id: new ObjectId(eventId) })
      .toArray();
    let first = result[0];
    //console.log(first['tickets']);

    res.status(200).json(first["tickets"]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
}

module.exports = function () {
  const router = express.Router();

  router.get("/events", getEvents);
  router.get("/events/:eventId", getEventById);
  router.get('/events/:eventId/tickets"', getTickes);

  return router;
};
