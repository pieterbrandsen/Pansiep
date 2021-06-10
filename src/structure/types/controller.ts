import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { TryToCreateUpgradeJob } from "./helper";

/**
 * Execute an controller
 *
 * @param {StructureController} str - Controller structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteController(
  str: StructureController
): FunctionReturn {
  TryToCreateUpgradeJob(str.room);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
