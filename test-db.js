const { MongoClient } = require('mongodb');

// Replace <password> with your actual password
const uri = "mongodb+srv://dbAdmin:Alice%4026-Anu%4025@dinetech.ivjthsu.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");
    
    // Check the list of databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("Available Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

  } catch (e) {
    console.error("❌ Connection failed:");
    console.error(e);
  } finally {
    await client.close();
  }
}

run();