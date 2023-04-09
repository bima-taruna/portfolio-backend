const express = require("express");
const { User } = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  try {
    const userList = await User.find().select("username isAdmin");

    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const userList = await User.findById(req.params.id).select(
      "username isAdmin"
    );

    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    let users = new User({
      username: req.body.username,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      isAdmin: req.body.isAdmin,
    });
    users = await users.save();
    if (!users) {
      return res.status(404).send("users tidak bisa dibuat");
    }
    res.send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let users = await User.findById(req.params.id);
    await users.remove();
    res.json(users);
  } catch (error) {
    console.log(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    let users = User.findById(req.params.id);
    let userData = {
      username: req.body.username || users.username,
      passwordHash: req.body.passwordHash || users.passwordHash,
      isAdmin: req.body.isAdmin || users.isAdmin,
    };
    users = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
    });
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    const secret = process.env.secret;
    if (!user) {
      res.status(400).send("user tidak ditemukan");
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          name: user.name,
          isAdmin: user.isAdmin,
        },
        secret,
        { expiresIn: "1d" }
      );
      res.status(200).send({ user: user.username, token: token });
    } else {
      res.status(400).send("password salah");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
