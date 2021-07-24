/**
 * Generates an http response object based on params
 */
export default function FunctionReturnHelper(
  code: number,
  response?: unknown
): FunctionReturn {
  return { code, response };
}
