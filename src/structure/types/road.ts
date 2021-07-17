import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an road
 *
 * @param {StructureRoad} str - Container structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteRoad(
  str: StructureRoad
): FunctionReturn {
  RepairIfDamagedStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
