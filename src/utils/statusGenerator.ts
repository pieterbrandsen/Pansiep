import { FuncWrapper } from "./wrapper";

// eslint-disable-next-line
export const FunctionReturnHelper = FuncWrapper(function FunctionReturnHelper<
  T
>(code: number, response?: T): FunctionReturn {
  return { code, response };
});
