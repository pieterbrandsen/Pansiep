import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an factory
 *
 * @param {StructureFactory} str - Factory structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteFactory(
  str: StructureFactory
): FunctionReturn {
  RepairIfDamagedStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
