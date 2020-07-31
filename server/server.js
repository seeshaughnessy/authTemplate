const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Set up express
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb://localhost:27017/keeper",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  err => {
    if (err) throw err;
    console.log("Database connected");
  }
);

app.use("/users", require("./routes/userRouter"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
