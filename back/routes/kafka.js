var express = require("express");
var router = express.Router();
const { Kafka } = require("kafkajs");
const KafkaData = require("../models/kafkadata");
require("dotenv").config();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [process.env.BROKER_URI],
  logLevel: logLevel.INFO,
});

const consumer = kafka.consumer({ groupId: "test-group" });

const initKafka = async () => {
  console.log("start subscribe");
  await consumer.connect();
  await consumer.subscribe({
    topic: "my-topic",
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const newKafkaData = new KafkaData({ data: message.value });
      await newKafkaData.save();
      console.log({
        value: message.value.toString(),
      });
    },
  });
};

initKafka();

module.exports = router;
