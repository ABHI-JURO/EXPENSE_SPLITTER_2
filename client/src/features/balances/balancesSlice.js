import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchGroupBalances = createAsyncThunk(
  "balances/fetchByGroup",
  async (groupId) => {
    const res = await axiosInstance.get(`/groups/${groupId}/balances`);
    return res.data;
  },
);

export const fetchSimplifiedDebts = createAsyncThunk(
  "balances/fetchSimplified",
  async (groupId) => {
    const res = await axiosInstance.get(`/groups/${groupId}/simplified-debts`);
    return res.data;
  },
);

const balancesSlice = createSlice({
  name: "balances",
  initialState: {
    balances: [],
    simplifiedDebts: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupBalances.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGroupBalances.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.balances = action.payload;
      })
      .addCase(fetchGroupBalances.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSimplifiedDebts.fulfilled, (state, action) => {
        state.simplifiedDebts = action.payload;
      });
  },
});

export default balancesSlice.reducer;
