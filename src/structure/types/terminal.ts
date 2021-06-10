import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import {
  RepairIfDamagedStructure,
  TryToCreateWithdrawJob,
  TryToCreateTransferJob,
} from "./helper";

/**
 * Execute an terminal
 *
 * @param {StructureTerminal} str - Terminal structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteTerminal(
  str: StructureTerminal
): FunctionReturn {
  RepairIfDamagedStructure(str);
  TryToCreateWithdrawJob(str, 35);
  TryToCreateTransferJob(str, 20, RESOURCE_ENERGY, true);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
