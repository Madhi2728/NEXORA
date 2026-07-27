const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getMedicineInfo } = require("../controllers/medicineInfoController");

router.get("/", verifyToken, getMedicineInfo);

module.exports = router;
