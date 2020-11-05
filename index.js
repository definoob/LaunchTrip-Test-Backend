const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const app = express();

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"));

app.use(bodyParser.json());
app.use(cors());

app.use("/api", authRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
