const Truck = require("../models/truck");
const Driver = require("../models/driver");
const Tire = require("../models/usedtire");
const Piece = require("../models/piece");
const mongoose = require("mongoose");

async function getDriver(trucks, pointer, max, drivers) {
  return new Promise((resolve, reject) => {
    Driver.findOne({ _id: trucks[pointer].driver })
      .then(result => {
        let truck = { ...trucks[pointer]._doc };
        truck["driver"] = result;
        drivers.push(truck);
        if (pointer < max) {
          getDriver(trucks, pointer + 1, max, drivers).then(() =>
            resolve(drivers)
          );
        } else {
          resolve(drivers);
        }
      })
      .catch(err => reject());
  });
}

async function getDrivers(trucks) {
  return new Promise((resolve, reject) => {
    getDriver(trucks, 0, trucks.length - 1, []).then(value => {
      resolve(value);
    });
  });
}

module.exports = app => {
  app.get("/truck", (req, res) => {
    let trucks = [];
    Truck.find()
      .then(result => {
        getDrivers(result).then(value => res.send(value));
      })
      .catch(err => res.send({ err: err }));
  });

  app.get("/truck/:id", (req, res) => {
    Truck.findOne({ _id: req.params.id }).then(r => {
      let truck = {
        plate: r.plate,
        mileage: r.mileage,
        driver: r.driver,
        status: r.status,
        tires: r.tires,
        expenses: r.expenses,
        notes: r.notes
      };
      Driver.findOne({ _id: truck.driver }).then(driver => {
        truck.driver = driver;
        res.send(truck);
      });
    });
  });

  app.get("/avaliable", (req, res) => {
    Truck.find({ status: true })
      .then(result => {
        getDrivers(result).then(value => res.send(value));
      })
      .catch(err => res.send({ err: err }));
  });

  app.get("/truck/nodriver", (req, res) => {
    let trucks = [];
    Truck.find({ driver: null })
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send({ err: err }));
  });

  app.post("/truck/:id/tire", (req, res) => {
    Truck.findOne({ _id: req.params.id }).then(r => {
      Truck.updateOne(
        { _id: req.params.id },
        {
          $push: {
            tires: {
              cod: req.body.cod,
              brand: req.body.brand.name,
              mileage: r.mileage
            }
          }
        }
      ).then(r => res.send(r));
    });
  });

  app.post("/truck/:id/tire/:tire_id", (req, res) => {
    Truck.findOne({ _id: req.params.id }).then(truck => {
      if (truck) {
        if (truck.tires.length > 0) {
          for (let i = 0; i < truck.tires.length; i++) {
            let tire = truck.tires[i];
            if (tire._id == req.params.tire_id) {
              tire.cod = req.body.cod;
              tire.brand = req.body.brand;
              truck.save().then(() => {
                res.send({ status: "ok" });
              });
            }
          }
        }
      }
    });
  });

  app.delete("/truck/:id/tire/:tire_id", (req, res) => {
    Truck.findOne({ _id: req.params.id }).then(truck => {
      if (truck) {
        if (truck.tires.length > 0) {
          let tires = truck.tires.filter(tire => {
            if (tire._id != req.params.tire_id) {
              return true;
            } else {
              const used_tire = new Tire({
                _id: new mongoose.Types.ObjectId(),
                cod: tire.cod,
                brand: tire.brand,
                mileage: truck.mileage - tire.mileage,
                truck: truck.plate,
                removeDate: Date.now()
              });

              used_tire.save().then(() => {
                return false;
              });
            }
          });
          truck.tires = tires;
          truck.save().then(() => {
            res.send({ status: "ok" });
          });
        }
      }
    });
  });

  app.post("/truck", (req, res) => {
    const truck = new Truck({
      _id: new mongoose.Types.ObjectId(),
      plate: req.body.plate,
      mileage: req.body.mileage,
      driver: req.body.driver,
      status: req.body.status
    });

    truck
      .save()
      .then(result => {
        res.send(result);
      })
      .catch(err => res.send(err));
  });

  app.post("/truck/:id/expenses", (req, res) => {
    console.log("eoq meu irmao: ", req.body);
    Truck.findOne({ _id: req.params.id }).then(r => {
      Truck.updateOne(
        { _id: req.params.id },
        {
          $push: {
            expenses: req.body
          }
        }
      ).then(r2 => {
        if (req.body.pieces.length > 0) {
          for (let i = 0; i < req.body.pieces.length; i++) {
            let piece = req.body.pieces[i];
            console.log(piece.name);
            Piece.updateOne(
              { name: piece.name },
              {
                $inc: {
                  stock: piece.qnt * -1
                }
              }
            ).then(r => res.send(r));
          }
        }
      });
    });
  });

  app.post("/truck/:id/notes", (req, res) => {
    console.log("notes: ", req.body);
    Truck.findOne({ _id: req.params.id }).then(r => {
      Truck.updateOne(
        { _id: req.params.id },
        {
          $push: {
            notes: req.body
          }
        }
      ).then(r2 => {
        res.send(r2);
      });
    });
  });

  app.post("/truck/:id", (req, res) => {
    const id = req.params.id;
    let props = [];
    Object.keys(req.body).forEach(key => {
      props.push({ propName: key, value: req.body[key] });
    });

    let updateOps = {};
    for (const ops of props) {
      updateOps[ops.propName] = ops.value;
    }
    Truck.updateOne({ _id: id }, { $set: updateOps })
      .exec()
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        res.send(err);
      });
  });
};
