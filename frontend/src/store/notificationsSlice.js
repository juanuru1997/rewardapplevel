import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import isEqual from "lodash/isEqual";

const API = "http://localhost:5000/api/notifications";
const token = () => localStorage.getItem("token");

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al obtener notificaciones");
    }
  }
);

export const markNotificationsAsSeen = createAsyncThunk(
  "notifications/markAsSeen",
  async (_, { rejectWithValue }) => {
    try {
      await axios.patch(`${API}/mark-as-seen`, null, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al marcar como leídas");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteOne",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al eliminar");
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(API, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al eliminar todas");
    }
  }
);

export const deleteMultipleNotifications = createAsyncThunk(
  "notifications/deleteMultiple",
  async (ids, { rejectWithValue }) => {
    try {
      await axios.patch(`${API}/bulk-delete`, { ids }, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al eliminar seleccionadas");
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (!isEqual(state.items, action.payload)) {
          state.items = action.payload;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(markNotificationsAsSeen.fulfilled, (state) => {
        state.items = state.items.map((notif) => ({
          ...notif,
          seen: true,
        }));
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      })

      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.items = [];
      })

      .addCase(deleteMultipleNotifications.fulfilled, (state, action) => {
        const idsToDelete = new Set(action.payload);
        state.items = state.items.filter((n) => !idsToDelete.has(n._id));
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
