const Freight = require("../models/freight");
const Driver = require("../models/driver");
const Truck = require("../models/truck");
const Fuel = require("../models/fuel");
const mongoose = require("mongoose");

function numfy(n) {
  if (typeof n === "string") return parseFloat(n.replace(/[^0-9]/g, ""));
  return n;
}

function getTruck(cargos, pointer, max, result) {
  console.log("Im on getTruck!");
  console.log(
    "cargos :",
    cargos,
    "pointer: ",
    pointer,
    "max: ",
    max,
    "result: ",
    result
  );

  return new Promise((resolve, reject) => {
    if (cargos.length > 0) {
      Truck.findOne({ _id: cargos[pointer].truck }).then(r => {
        Driver.findOne({ _id: cargos[pointer].driver }).then(r2 => {
          let cargo = { ...cargos[pointer]._doc };
          cargo.truck = r;
          cargo.driver = r2;
          result.push(cargo);
          if (pointer < max) {
            getTruck(cargos, pointer + 1, max, result).then(() => {
              resolve(result);
            });
          } else {
            resolve(result);
          }
        });
      });
    } else {
      resolve([]);
    }
  });
}

function getTrucks(cargos) {
  console.log("Im on getTrucks!");

  return new Promise((resolve, reject) => {
    getTruck(cargos, 0, cargos.length - 1, []).then(value => {
      resolve(value);
    });
  });
}

function resolveCargos(freights, pointer, max, result) {
  console.log("Im on resolveCargos!");

  return new Promise((resolve, reject) => {
    if (freights.length > 0) {
      getTrucks(freights[pointer].cargos).then(cargos => {
        let freight = { ...freights[pointer]._doc };
        freight.cargos = cargos;
        result.push(freight);
        if (pointer < max) {
          resolveCargos(freights, pointer + 1, max, result).then(() => {
            resolve(result);
          });
        } else {
          resolve(result);
        }
      });
    }
  });
}

function getCargos(freights) {
  console.log("Im on getCargos!");
  return new Promise((resolve, reject) => {
    resolveCargos(freights, 0, freights.length - 1, []).then(value => {
      resolve(value);
    });
  });
}

module.exports = app => {
  app.get("/freight", (req, res) => {
    Freight.find()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send({ err: err }));
  });

  app.get("/freight/:id", (req, res) => {
    Freight.findOne({
      _id: req.params.id
    })
      .then(result => {
        getTrucks(result.cargos).then(r => {
          let freight = { ...result._doc };
          freight.cargos = r;
          res.send(freight);
        });
      })
      .catch(err => res.send(err));
  });

  app.post("/freight", (req, res) => {
    console.log(req.body);
    let body = { ...req.body };
    body.price = numfy(body.price);
    const freight = new Freight(body);

    freight
      .save()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send(err));
  });

  app.post("/freight/:id", (req, res) => {
    console.log(req.body);
    const id = req.params.id;
    let props = [];
    Object.keys(req.body).forEach(key => {
      props.push({ propName: key, value: req.body[key] });
    });

    let updateOps = {};
    for (const ops of props) {
      updateOps[ops.propName] = ops.value;
    }
    Freight.updateOne({ _id: id }, { $set: updateOps })
      .exec()
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        res.send(err);
      });
  });

  app.post("/freight/:id/cargo", (req, res) => {
    Truck.updateOne(
      { _id: req.body.truck._id },
      { $set: { mileage: req.body.newMileage } }
    )
      .exec()
      .then(() => {
        Fuel.findOne({}).then(fuel => {
          Freight.updateOne(
            { _id: req.params.id },
            {
              $push: {
                cargos: {
                  truck: req.body.truck._id,
                  driver: req.body.truck.driver._id,
                  consumption: req.body.consumption,
                  waste: req.body.waste,
                  expenses: req.body.expenses,
                  distance: req.body.distance,
                  fuel: req.body.fuel,
                  weightArrive: req.body.weightArrive,
                  weightDepart: req.body.weightDepart,
                  date: Date.now(),
                  fuelPrice: fuel.price
                }
              }
            }
          )
            .exec()
            .then(r => res.send(r));
        });
      });
  });

  app.post("/freight/:id/cargo/:cargo_id", (req, res) => {
    console.log(req.body);
    Freight.findOne({ _id: req.params.id }).then(r => {
      if (r) {
        for (let i = 0; i < r.cargos.length; i++) {
          let cargo = r.cargos[i];
          if (cargo._id == req.params.cargo_id) {
            cargo.fuel = req.body.fuel;
            cargo.expenses = req.body.expenses;
            cargo.distance = req.body.distance;
            cargo.weightArrive = req.body.weightArrive;
            cargo.weightDepart = req.body.weightDepart;
            cargo.waste = cargo.weightDepart - cargo.weightArrive;
            cargo.consumption = (req.body.distance / req.body.fuel).toFixed(2);

            r.save();
            res.send({ status: "ok" });
          }
        }
      } else {
        res.send({ err: "erro, frete não encontrado!" });
      }
    });
  });

  app.get("/freight/types", (req, res) => {
    res.send(["soja", "trigo", "milho"]);
  });
};
