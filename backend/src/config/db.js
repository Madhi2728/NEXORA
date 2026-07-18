const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
