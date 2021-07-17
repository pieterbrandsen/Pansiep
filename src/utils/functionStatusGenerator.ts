/**
 * Generate an http response object based on params
 *
 * @param {number} name - Name of function
 * @param {T} [response] - Parameters of function
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     FunctionReturnHelper(FunctionReturnCodes.OK, {object: {}})
 */
// eslint-disable-next-line import/prefer-default-export
export const FunctionReturnHelper = function FunctionReturnHelper<T>(
  code: number,
  response?: T
): FunctionReturn {
  return { code, response };
};
