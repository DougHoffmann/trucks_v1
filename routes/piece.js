const Piece = require("../models/piece");
const mongoose = require("mongoose");

function numfy(n) {
  if (typeof n === "string") return parseFloat(n.replace(/[^0-9]/g, ""));
  return n;
}

module.exports = app => {
  app.get("/piece", (req, res) =>
    Piece.find()
      .then(r => res.send(r))
      .catch(e => res.send(e))
  );

  app.post("/piece", (req, res) => {
    const piece = new Piece({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      description: req.body.description,
      price: numfy(req.body.price),
      stock: numfy(req.body.stock)
    });

    piece
      .save()
      .then(r => res.send(r))
      .catch(e => res.send(e));
  });

  app.post("/piece/:id", (req, res) => {
    Piece.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          price: numfy(req.body.price),
          stock: numfy(req.body.stock)
        }
      }
    )
      .then(r => res.send(r))
      .catch(e => res.send(e));
  });
};
