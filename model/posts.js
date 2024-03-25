const { MongoClient, ObjectId } = require('mongodb');

const connectionUrl = process.env.DB_CONNECT_STRING;
const databaseName = "mydb";
const collectionName = "blog";

// Function to establish a database connection
async function connectToDatabase() {
  const client = new MongoClient(connectionUrl);
  await client.connect();
  const database = client.db(databaseName);
  const collection = database.collection(collectionName);

  return { client, collection };
}

// Find multiple documents
async function findManyDocuments(query) {
    const { client, collection } = await connectToDatabase();
    const documents = await collection.find(query).toArray();
    client.close();
    return documents;
}

// Find a single document by ID
async function findOneDocument(documentId) {
    const { client, collection } = await connectToDatabase();
    const document = await collection.findOne({ _id: new ObjectId(documentId) });
    client.close();
    return document;
}

// Create a document
async function createDocument(document) {
  const { client, collection } = await connectToDatabase();
  const result = await collection.insertOne(document);
  client.close();
  return result;
}

module.exports = {
    findManyDocuments,
    findOneDocument,
    createDocument
}