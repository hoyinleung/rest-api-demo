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

// Find multiple documents with Pagination
async function findManyDocumentsWithPagination(query,page,limit) {
  const { client, collection } = await connectToDatabase();

  // Calculate skip based on page and limit
  const skip = (page - 1) * limit;

  // Find documents with filter, skip, and limit
  const data = await collection.find(query).skip(skip).limit(limit).toArray();

  // Get total document count (optional)
  const totalResult = await collection.countDocuments(query);
  
  client.close();

  // Return paginated data and total count (optional)
  return {data,page,totalResult};
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

// Find hot documents
async function getHotPosts(viewCount) {
  const { client, collection } = await connectToDatabase();
  const documents = await collection.find({ views: { $gt: viewCount } }).toArray();
  client.close();
  return documents;
}

// 搜尋文章
async function searchDocumentByKeyword(keyword) {
  const { client, collection } = await connectToDatabase();
  //const document = await collection.find({content: {$regex:keyword}}).toArray();
  const document = await collection.find({$or: [
    { title: { $regex: new RegExp(keyword, 'i') }},
    { content: { $regex: new RegExp(keyword, 'i') }} //i : case-insensitive
  ]}).toArray();
  client.close();
  return document;
}

// Update a document
async function updateDocument(documentId, updatedFields) {
  const { client, collection } = await connectToDatabase();
  const result = await collection.updateOne(
    { _id: new ObjectId(documentId) },
    { $set: updatedFields }
  );
  client.close();
  return result;
}

// Delete a document
async function deleteDocument(documentId) {
  const { client, collection } = await connectToDatabase();
  const result = await collection.deleteOne({ _id: new ObjectId(documentId) });
  client.close();
  return result;
}

module.exports = {
    findManyDocuments,
    findOneDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocumentByKeyword,
    getHotPosts,
    findManyDocumentsWithPagination
}