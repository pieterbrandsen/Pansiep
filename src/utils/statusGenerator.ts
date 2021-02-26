// eslint-disable-next-line
export const FunctionReturnHelper = function FunctionReturnHelper<
  T
>(code: number, response?: T): FunctionReturn {
  return { code, response };
};
