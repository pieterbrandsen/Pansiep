import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an nuker
 *
 * @param {StructureNuker} str - Nuker structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteNuker(
  str: StructureNuker
): FunctionReturn {
  RepairIfDamagedStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
