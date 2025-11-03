// src/app/redux/sessionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session, SessionState } from "@/app/interfaces/sessionInterface";

const initialState: SessionState = {
  sessions: [],
};

const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setSessions: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload;
    },
    addSession: (state, action: PayloadAction<Session>) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action: PayloadAction<Session>) => {
      const index = state.sessions.findIndex(
        (s) => s._id === action.payload._id
      );
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter((s) => s._id !== action.payload);
    },
    clearSessions: (state) => {
      state.sessions = [];
    },
  },
});

export const {
  setSessions,
  addSession,
  updateSession,
  removeSession,
  clearSessions,
} = sessionSlice.actions;

export default sessionSlice.reducer;
