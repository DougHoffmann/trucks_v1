const Driver = require("../models/driver");
const Truck = require("../models/truck");
const mongoose = require("mongoose");

function numfy(n) {
  if (typeof n === "string") return parseFloat(n.replace(/[^0-9]/g, ""));
  return n;
}

function driverHasTruck(id) {
  Truck.findOne({
    driver: id
  }).then(r => {
    if (r === null) {
      console.log("motorista disponivel: ", id);
    }
  });
}

function hasTruck(drivers, pointer, max, avaliable) {
  return new Promise((resolve, reject) => {
    Truck.findOne({ driver: drivers[pointer]._id }).then(r => {
      if (r === null) avaliable.push(drivers[pointer]);
      pointer++;
      if (pointer < max) {
        hasTruck(drivers, pointer, max, avaliable).then(() => resolve());
      } else {
        resolve();
      }
    });
  });
}

module.exports = app => {
  app.get("/driver", (req, res) => {
    Driver.find()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send({ err: err }));
  });

  app.get("/driver/avaliable", (req, res) => {
    let avaliable = [];
    Driver.find()
      .then(r => hasTruck(r, 0, r.length, avaliable))
      .then(() => {
        res.send(avaliable);
      });
  });

  app.post("/driver", (req, res) => {
    console.log(req.body);
    const driver = new Driver({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      license: req.body.license,
      salary: numfy(req.body.salary),
      truck: req.body.truck,
      status: req.body.status
    });

    driver
      .save()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send(err));
  });

  app.post("/driver/:id", (req, res) => {
    const id = req.params.id;
    let props = [];
    Object.keys(req.body).forEach(key => {
      props.push({ propName: key, value: req.body[key] });
    });

    let updateOps = {};
    for (const ops of props) {
      if (ops.propName === "salary") {
        updateOps[ops.propName] = numfy(ops.value);
      } else {
        updateOps[ops.propName] = ops.value;
      }
    }
    Driver.updateOne({ _id: id }, { $set: updateOps })
      .exec()
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        res.send(err);
      });
  });
};
