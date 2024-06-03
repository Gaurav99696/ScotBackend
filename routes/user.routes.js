const router = require("express").Router();
const usersControllers = require("../controllers/user.controllers");

router.post("/register", usersControllers.registerUser);
router.post("/verifyUser", usersControllers.verifyUser);
router.post("/login", usersControllers.loginUser);
router.get("/getAllUsers/:userName", usersControllers.getAllUsers);
router.get("/getSingleUser/:userName", usersControllers.getSingleUser);
router.delete("/deleteUser/:userName", usersControllers.deleteUser);
router.patch("/editUserAcc/:id", usersControllers.editUserAcc);

module.exports = router;
