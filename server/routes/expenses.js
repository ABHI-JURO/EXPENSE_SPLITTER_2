const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth.middleware");

router.post("/", verifyToken, async (req, res) => {
  const { group_id, description, amount, split_type, category, splits } =
    req.body;
  const paid_by = req.user.user_id;

  // Validation
  if (
    !group_id ||
    !description?.trim() ||
    !amount ||
    !splits ||
    splits.length === 0
  ) {
    return res
      .status(400)
      .json({
        error: "group_id, description, amount, and splits are required",
      });
  }
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }
  const splitsTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  if (Math.abs(splitsTotal - amount) > 0.01) {
    return res
      .status(400)
      .json({ error: "Splits must add up to the total amount" });
  }
  if (splits.some((s) => !s.user_id || s.amount < 0)) {
    return res
      .status(400)
      .json({
        error: "Each split needs a valid user_id and non-negative amount",
      });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const expenseResult = await client.query(
      `INSERT INTO expenses (group_id, description, amount, paid_by, split_type, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [group_id, description, amount, paid_by, split_type, category],
    );
    const expenseId = expenseResult.rows[0].id;

    for (const split of splits) {
      await client.query(
        `INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)`,
        [expenseId, split.user_id, split.amount],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ expense_id: expenseId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// List all expenses for a group
router.get("/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await pool.query(
      `SELECT e.id, e.description, e.amount, e.split_type, e.category, e.created_at,
              u.name AS paid_by_name
       FROM expenses e
       JOIN users u ON u.id = e.paid_by
       WHERE e.group_id = $1
       ORDER BY e.created_at DESC`,
      [groupId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
