const mongoose = require("mongoose");
const Truck = require("./models/truck");
const Tire = require("./models/usedtire");
const Freight = require("./models/freight");
const moment = require("moment");

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "formtest";

const client = new MongoClient(url, { useNewUrlParser: true });

// Use connect method to connect to the server

module.exports = (app, db) => {
  app.get("/analytics/", (req, res) => {
    console.log("Making Trucks and Drivers Analytics ...");
    Freight.aggregate([
      { $unwind: "$cargos" },
      { $unwind: "$cargos.distance" },
      {
        $project: {
          cargos: "$cargos",
          truck: "$cargos.truck",
          driver: "$cargos.driver",
          price: "$price",
          month: { $month: "$cargos.date" },
          year: { $year: "$cargos.date" }
        }
      },
      {
        $group: {
          _id: {
            truck: "$truck",
            month: "$month",
            year: "$year",
            driver: "$driver"
          },
          consumption: { $avg: "$cargos.consumption" },
          distance: { $sum: "$cargos.distance" },
          weight: { $sum: "$cargos.weightArrive" },
          waste: { $sum: "$cargos.waste" },
          income: {
            $sum: {
              $divide: [{ $multiply: ["$price", "$cargos.weightArrive"] }, 1000]
            }
          },
          waste_expense: {
            $sum: {
              $divide: [{ $multiply: ["$cargos.waste", "$price"] }, 1000]
            }
          },
          fuel_expense: {
            $sum: { $multiply: ["$cargos.distance", "$cargos.fuelPrice"] }
          },
          expense: { $sum: "$cargos.expenses" },

          count: { $sum: 1 }
        }
      },
      { $out: "analysis_truck" }
    ]).then(r2 => {
      console.log("Trucks and Drivers Analytics...done!");
    });

    console.log("All freights analytics");
    Freight.aggregate([
      { $unwind: "$cargos" },
      {
        $project: {
          cargos: "$cargos",
          price: "$price",
          month: { $month: "$cargos.date" },
          year: { $year: "$cargos.date" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          consumption: { $avg: "$cargos.consumption" },
          waste: { $sum: "$cargos.waste" },
          waste_avg: { $avg: "$cargos.waste" },
          distance: { $sum: "$cargos.distance" },
          weight: { $sum: "$cargos.weightArrive" },
          count: { $sum: 1 },
          income: {
            $sum: {
              $divide: [{ $multiply: ["$price", "$cargos.weightArrive"] }, 1000]
            }
          },
          fuel_expense: {
            $sum: {
              $multiply: ["$cargos.fuel", "$cargos.fuelPrice"]
            }
          },
          total_expenses: {
            $sum: "$cargos.expenses"
          }
        }
      },
      { $out: "analysis_complete" }
    ]).then(freightAnalysis => {
      console.log("All freights analysis...done!");
      res.send(freightAnalysis);
    });
  });

  app.get("/analytics/expenses", (req, res) => {
    client.connect(function(err) {
      Truck.aggregate([
        {
          $project: {
            expenses: "$expenses"
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$expenses.date" },
              year: { $year: "$expenses.date" }
            },
            total: { $sum: "$expenses.total" }
          }
        },
        {
          $out: "test_exp"
        }
      ]).then(analysis => {
        res.send(analysis);
      });
    });
  });

  app.get("/analytics/truck/:id", (req, res) => {
    client.connect(function(err) {
      assert.equal(null, err);

      const db = client.db(dbName);

      db.collection("analysis_truck")
        .find({})
        .toArray((err, r) => {
          let result = [];
          for (let i = 0; i < r.length; i++) {
            let d = r[i];
            if (d._id.truck === req.params.id) {
              result.push(d);
            }
          }
          res.send(result);
        });
    });
  });

  app.get("/analytics/driver/:id", (req, res) => {
    client.connect(function(err) {
      assert.equal(null, err);

      const db = client.db(dbName);

      db.collection("analysis_truck")
        .find({})
        .toArray((err, r) => {
          let result = [];
          for (let i = 0; i < r.length; i++) {
            let d = r[i];
            if (d._id.driver === req.params.id) {
              result.push(d);
            }
          }
          res.send(result);
        });
    });
  });

  app.get("/analytics/all", (req, res) => {
    client.connect(function(err) {
      assert.equal(null, err);

      const db = client.db(dbName);

      db.collection("analysis_complete")
        .find({})
        .toArray((err, r) => {
          console.log("aq");
          console.log(r);
          res.send(r);
        });
    });
  });
};
