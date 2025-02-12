const mongoUsername = process.env.MONGO_INITDB_ROOT_USERNAME || 'root';
const mongoPassword = process.env.MONGO_INITDB_ROOT_PASSWORD || 'examplepassword';
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';
const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';

const mongoConnection = process.env.MONGODB_URI || 
  `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/?authSource=${authSource}`;


module.exports = mongoConnection;