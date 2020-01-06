const mongoose = require("mongoose");

const freightSchema = mongoose.Schema({
  price: Number,
  openDate: Date,
  closeDate: Date,
  depart: mongoose.Schema({
    name: String,
    country: String
  }),
  arrive: mongoose.Schema({
    name: String,
    country: String
  }),
  type: {
    name: String,
    color: String
  },
  cargos: [
    {
      weightDepart: Number,
      weightArrive: Number,
      fuel: Number,
      distance: Number,
      expenses: Number,
      waste: Number,
      consumption: Number,
      truck: String,
      driver: String,
      date: Date,
      fuelPrice: Number
    }
  ]
});

module.exports = mongoose.model("Freight", freightSchema);

/*
$push: {
  date: "$date",
  weightDepart: "$cargos.weightDepart",
  weightArrive: "$cargos.weightArrive",
  fuel: "$cargos.fuel",
  distance: "$cargos.distance",
  expenses: "$cargos.expenses",
  waste: "$cargos.waste",
  consumption: "$cargos.consumption",
  truck: "$cargos.truck",
  driver: "$cargos.driver"
}
*/
