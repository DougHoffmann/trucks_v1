const Type = require("../models/type");
const mongoose = require("mongoose");

module.exports = app => {
  app.get("/type", (req, res) => {
    Type.find()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send({ err: err }));
  });

  app.post("/type", (req, res) => {
    const type = new Type({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      color: req.body.color
    });

    type
      .save()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send(err));
  });
};
