const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
//mongo
const { MongoClient, ObjectId } = require('mongodb');
const geolib = require('geolib');

const uri = 'mongodb+srv://user:sdeTest@cluster0.t2c3w1d.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": true,
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 },
    rolling: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(`Hello World!`);
  console.log("Cookies: ", req.cookies["connect.sid"]);
  console.log("Session: ", req.session);
  console.log("Session ID: ", req.sessionID);
  req.session.views = req.session.views ? req.session.views + 1 : 1;
  console.log("Session views: ", req.session.views);
});

//Post buy(ticket...)


//Mongo API 
app.get("/events", async (req, res) => {
  const lat = req.query['lat'];
  const lon = req.query['lon'];
  let range = req.query['range'] ?? 100; //Km

  //Check if lat and lon are provided
  if ((lat && !lon) || (!lat && lon)) {
    return res.status(400).json({ error: 'Both lat and lon parameters are required.' });
  }
  let v = 0;
  try{
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Events');

    let result = await collection.find({}).toArray();
    
    if(lat && lon){
      //Filtra per posizione
      const userLocation = { latitude: parseFloat(lat), longitude: parseFloat(lon) };

      result = await Promise.all(
        result.map(async (event) => {
          const c2 = database.collection('Locations');
          const r = await c2.find({_id: event['venueId']}).toArray();
          first = r[0];
          const eventLocation = first['location'];
          const distance = geolib.getDistance(userLocation, eventLocation);
          const distanceInKm = geolib.convertDistance(distance, 'km');
          //console.log("DISTANCE => " + distanceInKm + " RANGE => " + range);
          if(distanceInKm <= parseFloat(range))
            return event;
        })
      );
    }
    result = result.filter((event) => event !== undefined);
    res.status(200).json(result);
  }catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});


app.get('/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Events');

    const result = await collection.find({_id : new ObjectId(eventId)}).toArray();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});

app.get('/events/:eventId/tickets', async (req, res) => {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Events');

    const result = await collection.find({_id : new ObjectId(eventId)}).toArray();
    let first = result[0];
    //console.log(first['tickets']);

    res.status(200).json(first['tickets']);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});


app.get("/locations", async (req, res) => {

    try {
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Locations');

    const result = await collection.find({}).toArray();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});

app.get('/locations/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Locations');

    const result = await collection.find({_id : new ObjectId(eventId)}).toArray();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});

app.get("/artists", async (req, res) => {

  try {
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Artists');

    const result = await collection.find({}).toArray();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});

app.get('/artists/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  console.log(eventId);

  try {
    await client.connect();

    const database = client.db('Shop');
    const collection = database.collection('Artists');

    const result = await collection.find({_id : new ObjectId(eventId)}).toArray();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }

});


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
