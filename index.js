const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post"); // Added Post Routes
const { errorHandler } = require("./auth");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_STRING);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "can not connect to database"));
db.once("open", () => console.log("Connected to the database"));

app.use("/users", userRoutes);
app.use("/posts", postRoutes); // Mounted Post Endpoints

app.use(errorHandler);

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`We are running at ${process.env.PORT || 3000}`);
    });
}

module.exports = { app, mongoose };