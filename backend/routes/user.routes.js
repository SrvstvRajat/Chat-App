const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/:id", userController.getUserById);

router.post("/signup", userController.createUser);

router.post("/login", userController.loginUser);

router.get("/", userController.getAllUsers);

module.exports = router;
