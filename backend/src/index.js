import express from "express"; //express is the framework we are using to create the server

import authRoutes from "./routes/auth.route.js"; //importing the auth routes
import messageRoutes from "./routes/message.route.js"; //importing the message routes

import { server, app } from "./lib/socket.js";

import dotenv from "dotenv"; //dotenv is used to load environment variables from a .env file into process.env
import path from "path";
import { connectDB } from "./lib/db.js"; //importing the connectDB function to connect to the database
import cookieParser from "cookie-parser"; //importing cookie-parser to parse cookies from the request
import cors from "cors"; //importing cors to enable Cross-Origin Resource Sharing

dotenv.config(); //loading the environment variables from the .env file

const PORT = process.env.PORT; //setting the port to 5001 or the port from the environment variable
const __dirname = path.resolve();

app.use(express.json()); //middleware to parse JSON data from the request body
app.use(cookieParser()); //middleware to parse cookies from the request
app.use(
  cors({
    origin: "http://localhost:5173", //allowing requests from the client URL
    credentials: true, //allowing credentials to be sent with the request
  })
); //middleware to enable CORS

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server started on port PORT:" + PORT);
  connectDB(); //connecting to the database
  console.log(process.env.MONGODB_URI); //logging the MongoDB URI to the console
});
