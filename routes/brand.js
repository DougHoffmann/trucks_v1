const Brand = require("../models/brand");
const Tire = require("../models/usedtire");
const Fuel = require("../models/fuel");
const mongoose = require("mongoose");

module.exports = app => {
  app.get("/brand", (req, res) => {
    Brand.find()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send({ err: err }));
  });

  app.get("/tire", (req, res) => {
    Tire.find()
      .then(r => {
        res.send(r);
      })
      .catch(e => res.send(e));
  });

  app.post("/brand", (req, res) => {
    console.log(req.body);
    const brand = new Brand({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      country: req.body.country
    });

    brand
      .save()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send(err));
  });

  app.post("/brand/name", (req, res) => {
    Brand.findOne({ name: req.body.name }).then(brand => {
      res.send(brand);
    });
  });

  app.get("/fuel", (req, res) => {
    Fuel.findOne({}).then(r => {
      res.send(r);
    });
  });

  app.post("/fuel", (req, res) => {
    Fuel.updateOne({}, { $set: { price: req.body.price } }).then(r => {
      res.send(r);
    });
  });
};
