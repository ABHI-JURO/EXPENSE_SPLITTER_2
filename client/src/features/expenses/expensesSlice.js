import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Fetch all expenses for a group
export const fetchGroupExpenses = createAsyncThunk(
  "expenses/fetchByGroup",
  async (groupId) => {
    const res = await axiosInstance.get(`/expenses/group/${groupId}`);
    return res.data;
  },
);

// Create a new expense
export const createExpense = createAsyncThunk(
  "expenses/create",
  async ({ group_id, description, amount, split_type, category, splits }) => {
    const res = await axiosInstance.post("/expenses", {
      group_id,
      description,
      amount,
      split_type,
      category,
      splits,
    });
    return res.data; // { expense_id }
  },
);

export const updateExpense = createAsyncThunk(
  "expenses/update",
  async ({ id, description, amount, category, splits }) => {
    const res = await axiosInstance.put(`/expenses/${id}`, {
      description,
      amount,
      category,
      splits,
    });
    return res.data;
  },
);

export const deleteExpense = createAsyncThunk("expenses/delete", async (id) => {
  await axiosInstance.delete(`/expenses/${id}`);
  return id;
});

export const toggleExpenseSettled = createAsyncThunk(
  "expenses/toggleSettled",
  async ({ id, settled }) => {
    await axiosInstance.patch(`/expenses/${id}/settle`, { settled });
    return { id, settled };
  },
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    list: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupExpenses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchGroupExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createExpense.fulfilled, (state) => {
        // component will re-fetch after this
      })
      .addCase(updateExpense.fulfilled, (state) => {
        // component will re-fetch after this
      })
      .addCase(deleteExpense.fulfilled, (state) => {
        // component will re-fetch after this
      })
      .addCase(toggleExpenseSettled.fulfilled, (state) => {
        // component will re-fetch after this
      });
  },
});

export default expensesSlice.reducer;
