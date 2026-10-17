export { store } from "./store";
export type { RootState, AppDispatch, AppStore } from "./store";
export { useAppDispatch, useAppSelector } from "./hooks";

// Next.js App Router store creation helper
export const makeStore = () => {
  return (require("./store") as typeof import("./store")).store;
};
