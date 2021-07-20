import FuncWrapper from "../../utils/wrapper";
import {
  RepairIfDamagedStructure,
  TryToCreateWithdrawJob,
  TryToCreateTransferJob,
} from "./helper";

/**
 * Execute an terminal
 */
export default FuncWrapper(function ExecuteTerminal(
  str: StructureTerminal
): void {
  RepairIfDamagedStructure(str);
  TryToCreateWithdrawJob(str, 35);
  TryToCreateTransferJob(str, 20, RESOURCE_ENERGY, true);
});
