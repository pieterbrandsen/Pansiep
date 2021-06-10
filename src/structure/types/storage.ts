import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import {
  RepairIfDamagedStructure,
  TryToCreateWithdrawJob,
  TryToCreateTransferJob,
} from "./helper";

/**
 * Execute an storage
 *
 * @param {StructureObserver} str - Storage structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteStorage(
  str: StructureStorage
): FunctionReturn {
  RepairIfDamagedStructure(str);
  TryToCreateWithdrawJob(str, 50);
  TryToCreateTransferJob(str, 20);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
