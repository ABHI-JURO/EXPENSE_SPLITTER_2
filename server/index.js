const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const usersRouter = require("./routes/users");
const expensesRouter = require("./routes/expenses");
const groupsRouter = require("./routes/groups");
const settlementsRouter = require("./routes/settlements");

app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/settlements", settlementsRouter);

const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

// Test route — confirms DB connection works
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
