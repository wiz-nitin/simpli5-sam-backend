const { connectDatabase } = require("db-service/config/db");
const { User } = require("db-service/models/user");
const { generateOTP } = require("db-service/utils/helper");

module.exports = exports.handler = async (event) => {
  try {
    await connectDatabase();
    const body = JSON.parse(event.body);

    return {
      statusCode: 201,
      body: JSON.stringify("userObj"),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}