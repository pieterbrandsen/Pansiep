/**
 * Generates an http response object based on params
 */
// eslint-disable-next-line import/prefer-default-export
export default function FunctionReturnHelper<T>(
  code: number,
  response?: T
): FunctionReturn {
  return { code, response };
}
