require("dotenv").config();
const { json } = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getDbLocations(quary = {}) {
  if(quary._id){
    quary._id = new ObjectId(quary._id);
  }

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("locations");
  const result = await collection.find(quary).toArray();

  await client.close();

  return result;
}

async function getDbEvents(quary = {}) {
  if(quary._id){
    quary._id = new ObjectId(quary._id);
  }

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("events");
  const result = await collection.find(quary).sort({date:1}).toArray();

  await client.close();

  return result;
}

async function getDbEvent(quary = {}) {
  if(quary._id){
    quary._id = new ObjectId(quary._id);
  }

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("events");
  const result = await collection.aggregate([
    {
      $match: quary
    },
    {
      $lookup: {
        from: "locations",
        localField: "venueId",
        foreignField: "_id",
        as: "venues"
      }
    },
    {
      $lookup: {
        from: "artists",
        localField: "artistId",
        foreignField: "_id",
        as: "artists"
      }
    }
  ]).toArray();
  await client.close();

  return result;
}

async function getDbArtists(quary = {}) {
  if(quary._id){
    quary._id = new ObjectId(quary._id);
  }

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("artists");
  const result = await collection.find(quary).toArray();

  await client.close();

  return result;
}

module.exports = { client, ObjectId, getDbLocations, getDbEvents, getDbEvent, getDbArtists};
