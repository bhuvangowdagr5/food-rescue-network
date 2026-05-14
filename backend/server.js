const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const http = require("http");

const { Server } = require("socket.io");

const User = require("./models/User");

const app = express();

const server =
  http.createServer(app);

const io =
  new Server(server, {

    cors: {
      origin: "*"
    }

  });

const JWT_SECRET =
  "foodrescue_secret_key";

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);

mongoose.connect(
  "mongodb://127.0.0.1:27017/foodrescue"
)

.then(() => {

  console.log(
    "MongoDB Connected"
  );

})

.catch((err) => {

  console.log(err);

});

const storage =
  multer.diskStorage({

    destination: function(
      req,
      file,
      cb
    ){

      cb(null, "uploads/");

    },

    filename: function(
      req,
      file,
      cb
    ){

      cb(

        null,

        Date.now() +
        path.extname(
          file.originalname
        )

      );

    }

});

const upload =
  multer({

    storage: storage

});

const donationSchema =
  new mongoose.Schema({

    foodName: String,

    foodType: String,

    condition: String,

    quantity: String,

    location: String,

    details: String,

    expiresAt: {
      type: Date
    },

    image: String,

    status: {

      type: String,

      default: "pending"

    },

    createdAt: {

      type: Date,

      default: Date.now

    }

});

const Donation =
  mongoose.model(
    "Donation",
    donationSchema
  );

app.post(

  "/donate",

  upload.single("foodImage"),

  async (req, res) => {

    try {

      const donation =
        new Donation({

          foodName:
            req.body.foodName,

          foodType:
            req.body.foodType,

          condition:
            req.body.condition,

          quantity:
            req.body.quantity,

          location:
            req.body.location,

          details:
            req.body.details,

          expiresAt:
            new Date(

              Date.now() +

              req.body.expiryTime *
              60 *
              60 *
              1000

            ),

          image:
            req.file
            ? req.file.filename
            : ""

        });

      await donation.save();

      io.emit(
        "newDonation",
        donation
      );

      res.json({

        success: true,

        message:
          "Donation Saved"

      });

    } catch(error){

      res.status(500).json({

        success: false,

        message:
          "Error saving donation"

      });

    }

});

app.get(

  "/donations",

  async (req, res) => {

    try {

      const donations =

        await Donation.find({

          status: "pending",

          expiresAt: {
            $gt: new Date()
          }

        });

      res.json(donations);

    } catch(error){

      res.status(500).json({

        success: false

      });

    }

});

app.put(

  "/accept/:id",

  async (req, res) => {

    try {

      await Donation.findByIdAndUpdate(

        req.params.id,

        {

          status: "accepted"

        }

      );

      res.json({

        success: true

      });

    } catch(error){

      res.json({

        success: false

      });

    }

});

app.post(

  "/signup",

  async (req, res) => {

    try {

      const {

        username,
        mobile,
        email,
        password,
        role

      } = req.body;

      const existingUser =

        await User.findOne({
          email
        });

      if(existingUser){

        return res.json({

          success: false,

          message:
            "Email already exists"

        });

      }

      const hashedPassword =

        await bcrypt.hash(
          password,
          10
        );

      const newUser =
        new User({

          username,
          mobile,
          email,

          password:
            hashedPassword,

          role

        });

      await newUser.save();

      res.json({

        success: true,

        message:
          "Signup successful"

      });

    } catch(error){

      res.json({

        success: false,

        message:
          "Signup failed"

      });

    }

});

app.post(

  "/login",

  async (req, res) => {

    try {

      const {

        email,
        password

      } = req.body;

      const user =

        await User.findOne({
          email
        });

      if(!user){

        return res.json({

          success: false,

          message:
            "User not found"

        });

      }

      const isMatch =

        await bcrypt.compare(

          password,

          user.password

        );

      if(!isMatch){

        return res.json({

          success: false,

          message:
            "Invalid password"

        });

      }

      const token =

        jwt.sign(

          {

            id: user._id,

            role: user.role

          },

          JWT_SECRET,

          {

            expiresIn: "7d"

          }

        );

      res.json({

        success: true,

        token,

        user: {

          username:
            user.username,

          email:
            user.email,

          role:
            user.role

        }

      });

    } catch(error){

      res.json({

        success: false,

        message:
          "Login failed"

      });

    }

});

io.on(

  "connection",

  (socket) => {

    console.log(
      "User Connected 🔌"
    );

  }

);

app.get("/", (req, res) => {

  res.send(
    "Food Rescue Backend Running 🚀"
  );

});

server.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});