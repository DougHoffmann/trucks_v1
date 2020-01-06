const express = require("express");
const app = express();
var cors = require("cors");
const mongoose = require("mongoose");

const Auth = require("./models/user");

mongoose.connect("mongodb://localhost/formtest", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("connected to database"));

//middlerware
app.use(cors());
app.use(express.json());

// Routes
app.post("/auth", (req, res) => {
  Auth.find({ user: req.body.user })
    .then(result => {
      if (result.length) {
        let user = result[0];
        if (user.password === req.body.password) {
          res.send({ status: 3 });
        } else {
          res.send({ status: 2 });
        }
      } else {
        res.send({ status: 1 });
      }
    })
    .catch(err => res.send({ status: 0, error: err }));
});

require("./routes")(app);
require("./analytics")(app, db);

app.listen(3000, () => console.log("server started on port 3000"));
