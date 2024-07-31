require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
mongoose.set("strictQuery", true);
const authJwt = require("./config/jwt");
const api = process.env.API_URL;
const usersRouter = require("./routers/users");
const projectsRouter = require("./routers/project");

app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/projects`, projectsRouter);
app.get("/", (req, res) => {
  try {
    res.send("Hello");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "portfolio-database",
  })
  .then(() => {
    console.log("database ready");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log(api);
  console.log("server is running on http://localhost:3000");
});
