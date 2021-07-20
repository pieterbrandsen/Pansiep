import FuncWrapper from "../../utils/wrapper";
import {
  RepairIfDamagedStructure,
  TryToCreateWithdrawJob,
  TryToCreateTransferJob,
} from "./helper";

/**
 * Execute an storage
 */
export default FuncWrapper(function ExecuteStorage(
  str: StructureStorage
): void {
  RepairIfDamagedStructure(str);
  TryToCreateWithdrawJob(str, 50);
  TryToCreateTransferJob(str, 20);
});
