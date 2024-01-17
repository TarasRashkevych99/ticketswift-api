require("dotenv").config();
const { json } = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getDbLocations(quary = {}) {

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("locations");
  const result = await collection.find(quary).toArray();

  await client.close();

  return result;
}

async function getDbEvents(quary = {}) {

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("events");
  const result = await collection.find(quary).toArray();

  await client.close();

  return result;
}

async function getDbArtists(quary = {}) {

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("artists");
  const result = await collection.find(quary).toArray();

  await client.close();

  return result;
}

/* TODO 
    - Controllare dove inserire metodi addPurchase e updatePurchaseState (database.service o payment.service).
        Aggiungo nel file payments.service.js
    - Aggiungere chiamate a questi due metodi all'interno dei metodi che gestiscono paypal.
        Gestire la parte dello state, impostandolo a complete quando va a buon fine e a failed in caso contrario
          La gestione dello stato del pagamento viene fatta lato client, tramite i metodi onApprove e onCancel
    + Aggiungere campi createdAt, deletedAt nelle collections del DB.
    + Capire come funziona il redirect dopo completamento del pagamento paypal.
*/

async function addPurchase(purchaseData){

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("purchases");

  const newPurchase = {
    cart: purchaseData.cart,
    userId: purchaseData.userId,
    date: newDate(),
    state: "pending"
  }

  const result = await collection.insertOne(newPurchase);

  await client.close();

  return result.insertedId;

}

async function updatePurchaseState(purchaseId, newState){

  await client.connect();
  const database = client.db("Shop");
  const collection = database.collection("purchases");

  const filter = {_id: ObjectId(purchaseId)};
  const updatePurchase = {
    $set: {
      state: newState
    }
  };

  const result = await collection.updateOne(filter, updatePurchase);

  await client.close();  
}

module.exports = { client, ObjectId, getDbLocations, getDbEvents, getDbArtists, addPurchase, updatePurchaseState};
