const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware");

const router = express.Router();


// ADD transaction
router.post("/add", auth, async (req, res) => {
  const { title, amount, type, category } = req.body;

  const transaction = new Transaction({
    userId: req.userId,
    title,
    amount,
    type,
    category
  });

  await transaction.save();
  res.json({ message: "Transaction added" });
});


// GET transactions
router.get("/all", auth, async (req, res) => {
  const data = await Transaction.find({ userId: req.userId });
  res.json(data);
});
// delete
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

