import { configureStore } from "@reduxjs/toolkit";
import playerOneReducer from "./playerOneSlice";

export const store = configureStore({
  reducer: {
    playerOne: playerOneReducer
  }
});
