const mongoose = require("mongoose");

// Define Schemes
const kafkaSchema = new mongoose.Schema(
  {
    data: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("KafkaData", kafkaSchema);
