const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth.middleware");
const { simplifyDebts } = require("../utils/debtSimplifier");
const { getGroupBalances } = require("../db/queries/balances.queries");

// Create a new group — protected
router.post("/", verifyToken, async (req, res) => {
  const { name, member_ids } = req.body;
  const created_by = req.user.user_id;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Group name is required" });
  } // from token now, not the body

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const groupResult = await client.query(
      "INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id",
      [name, created_by],
    );
    const groupId = groupResult.rows[0].id;

    // Always include the creator as a member, plus whoever else was passed in
    const allMemberIds = [...new Set([created_by, ...(member_ids || [])])];

    for (const userId of allMemberIds) {
      await client.query(
        "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)",
        [groupId, userId],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ group_id: groupId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// List all groups the LOGGED-IN user belongs to — protected, no need for :userId param anymore
router.get("/mine", verifyToken, async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      `SELECT g.id, g.name, g.created_at
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List members of a specific group — left open (read-only, low risk)
router.get("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN group_members gm ON gm.user_id = u.id
       WHERE gm.group_id = $1`,
      [groupId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a member to an existing group — protected
router.post("/:groupId/members", verifyToken, async (req, res) => {
  const { groupId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  // Check the user actually exists before inserting
  const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
    user_id,
  ]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check they're not already a member
  const existing = await pool.query(
    "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2",
    [groupId, user_id],
  );
  if (existing.rows.length > 0) {
    return res
      .status(409)
      .json({ error: "User is already a member of this group" });
  }

  try {
    await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)",
      [groupId, user_id],
    );
    res.status(201).json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Balances — left open for now
router.get("/:groupId/balances", async (req, res) => {
  const { groupId } = req.params;
  try {
    const balances = await getGroupBalances(groupId);
    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simplified debts — left open for now
router.get("/:groupId/simplified-debts", async (req, res) => {
  const { groupId } = req.params;
  try {
    const balances = await getGroupBalances(groupId);
    const transactions = simplifyDebts(balances);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
