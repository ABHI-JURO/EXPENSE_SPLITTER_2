const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth.middleware");

// Record a settlement — protected, paid_by comes from the logged-in user
router.post("/", verifyToken, async (req, res) => {
  const { group_id, paid_to, amount } = req.body;
  const paid_by = req.user.user_id;

  if (!group_id || !paid_to || !amount) {
    return res
      .status(400)
      .json({ error: "group_id, paid_to, and amount are required" });
  }
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }
  if (paid_by === paid_to) {
    return res
      .status(400)
      .json({ error: "Cannot settle a debt with yourself" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO settlements (group_id, paid_by, paid_to, amount)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [group_id, paid_by, paid_to, amount],
    );
    res.status(201).json({ settlement_id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List settlements for a group — left open (read-only)
router.get("/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id, s.amount, s.settled_at,
              p.name AS paid_by_name, t.name AS paid_to_name
       FROM settlements s
       JOIN users p ON p.id = s.paid_by
       JOIN users t ON t.id = s.paid_to
       WHERE s.group_id = $1
       ORDER BY s.settled_at DESC`,
      [groupId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
