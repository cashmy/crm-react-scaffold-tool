import { configureStore } from "@reduxjs/toolkit";
import playerFourReducer from "./playerFourSlice";
import playerTwoReducer from "./playerTwoSlice";

export const store = configureStore({
  reducer: {
    playerFour: playerFourReducer,
    playerTwo: playerTwoReducer,
  },
});
