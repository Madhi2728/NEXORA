const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  checkDrugInteractions,
  listKnownMedicines,
} = require("../controllers/drugInteractionController");

// Any authenticated user (patient, doctor, or admin) can use this.
router.post("/check", verifyToken, checkDrugInteractions);
router.get("/medicines", verifyToken, listKnownMedicines);

module.exports = router;
