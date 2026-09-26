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
      });
  },
});

export default expensesSlice.reducer;
