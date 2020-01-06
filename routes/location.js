const Location = require("../models/location");
const mongoose = require("mongoose");

module.exports = app => {
  app.get("/location", (req, res) => {
    Location.find()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send({ err: err }));
  });

  app.post("/location", (req, res) => {
    console.log(req.body);
    const location = new Location({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      country: req.body.country
    });

    location
      .save()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send(err));
  });
};
