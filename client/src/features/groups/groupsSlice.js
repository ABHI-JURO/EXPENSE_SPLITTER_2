import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchMyGroups = createAsyncThunk("groups/fetchMine", async () => {
  const res = await axiosInstance.get("/groups/mine");
  return res.data;
});

export const createGroup = createAsyncThunk(
  "groups/create",
  async ({ name, member_ids }) => {
    const res = await axiosInstance.post("/groups", { name, member_ids });
    return res.data; // { group_id }
  },
);

export const deleteGroup = createAsyncThunk(
  "groups/delete",
  async (groupId) => {
    await axiosInstance.delete(`/groups/${groupId}`);
    return groupId;
  },
);

const groupsSlice = createSlice({
  name: "groups",
  initialState: {
    list: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyGroups.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createGroup.fulfilled, (state) => {
        // After creating, the component will re-fetch the list
      })
      .addCase(deleteGroup.fulfilled, (state) => {
        // component will re-fetch after this
      });
  },
});

export default groupsSlice.reducer;
