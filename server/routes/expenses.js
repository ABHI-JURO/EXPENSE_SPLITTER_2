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
    return res.status(400).json({
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
    return res.status(400).json({
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
              e.paid_by, e.settled, u.name AS paid_by_name
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
// Update an expense — only the person who paid can edit it
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { description, amount, category, splits } = req.body;
  const userId = req.user.user_id;

  if (
    !description?.trim() ||
    !amount ||
    amount <= 0 ||
    !splits ||
    splits.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "description, amount, and splits are required" });
  }
  const splitsTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  if (Math.abs(splitsTotal - amount) > 0.01) {
    return res
      .status(400)
      .json({ error: "Splits must add up to the total amount" });
  }

  const client = await pool.connect();
  try {
    // Ownership check
    const existing = await client.query(
      "SELECT paid_by FROM expenses WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (existing.rows[0].paid_by !== userId) {
      return res
        .status(403)
        .json({ error: "Only the person who paid can edit this expense" });
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE expenses SET description = $1, amount = $2, category = $3 WHERE id = $4`,
      [description, amount, category, id],
    );

    // Replace splits entirely — simplest correct approach
    await client.query("DELETE FROM expense_splits WHERE expense_id = $1", [
      id,
    ]);
    for (const split of splits) {
      await client.query(
        `INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)`,
        [id, split.user_id, split.amount],
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Expense updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Delete an expense — only the person who paid can delete it
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const existing = await pool.query(
      "SELECT paid_by FROM expenses WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (existing.rows[0].paid_by !== userId) {
      return res
        .status(403)
        .json({ error: "Only the person who paid can delete this expense" });
    }

    await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle settled status — only the payer can mark it
router.patch("/:id/settle", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { settled } = req.body;
  const userId = req.user.user_id;

  try {
    const existing = await pool.query(
      "SELECT paid_by FROM expenses WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (existing.rows[0].paid_by !== userId) {
      return res
        .status(403)
        .json({ error: "Only the person who paid can update this" });
    }

    await pool.query("UPDATE expenses SET settled = $1 WHERE id = $2", [
      settled,
      id,
    ]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
