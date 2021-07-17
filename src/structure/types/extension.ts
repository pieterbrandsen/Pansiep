import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure, TryToCreateTransferJob } from "./helper";

/**
 * Execute an extension
 *
 * @param {StructureExtension} str - Extension structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteExtension(
  str: StructureExtension
): FunctionReturn {
  RepairIfDamagedStructure(str);
  TryToCreateTransferJob(str, 100);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
