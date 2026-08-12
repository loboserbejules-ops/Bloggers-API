const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth")

router.post("/register", userController.registerUser);

router.post("/details", verify, userController.getProfile);

router.post("/login", userController.loginUser);

router.post("/check-email", userController.checkEmailExists);

router.post('/reset-password', verify, userController.resetPassword);

module.exports = router;