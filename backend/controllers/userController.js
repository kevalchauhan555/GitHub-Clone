const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;

const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGODB_URI;
let client;

async function connectToClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

const signUp = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await connectToClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });
    if (user) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({token, userId:result.insertId});
  } catch (err) {
    console.log(err);
    res.status(500).send("Error during Signup: ");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    await connectToClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).send("User does not exist");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token,userId: user._id });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error during Login: ");
  }
};

const getAllUsers = async (req, res) => {
  try {
    await connectToClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const user = await usersCollection.find({}).toArray();
    res.json(user);
  } catch (err) {
    console.log("Error During Fetching", err);
    res.status(500).send("Error during fetching users");
  }
};

const getUserProfile = async (req, res) => {
  const currentID = req.params.id;
  try {
    await connectToClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID),
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.send(user);
  } catch (err) {
    console.log("Error during fetching: ", err.message);
    res.status(500).send("Server error!");
  }
};

const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectToClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    let updatedFields = { email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      upodatedFields.password = hashedPassword;
    }
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(currentID) },
      { $set: updatedFields },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.send(result.value);
  } catch (err) {
    console.log("Error during updating: ", err.message);
    res.status(500).send("Server error!");
  }
};

const deleteUserProfile = async (req, res) => {
  const currentID = req.params.id;

  try {
    await connectToClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id:  ObjectId(currentID),
    });

    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error during deleting: ", err.message);
    res.status(500).send("Server error!");
  }
};

module.exports = {
  getAllUsers,
  signUp,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
