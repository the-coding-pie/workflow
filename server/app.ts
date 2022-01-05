import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// dotenv config
dotenv.config();

// connectDB

const app = express();

const PORT = process.env.PORT || 8000;

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Hi");
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
