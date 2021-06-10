import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure, TryToCreateTransferJob } from "./helper";

/**
 * Execute an lab
 *
 * @param {StructureLab} str - Lab structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteLab(
  str: StructureLab
): FunctionReturn {
  RepairIfDamagedStructure(str);
  TryToCreateTransferJob(str, 100);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
