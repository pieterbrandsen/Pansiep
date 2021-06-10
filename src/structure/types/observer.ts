import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an observer
 *
 * @param {StructureObserver} str - Container structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteObserver(
  str: StructureObserver
): FunctionReturn {
  RepairIfDamagedStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
