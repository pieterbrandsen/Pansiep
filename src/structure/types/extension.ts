import FuncWrapper from "../../utils/wrapper";
import { RepairIfDamagedStructure, TryToCreateTransferJob } from "./helper";

/**
 * Execute an extension
 */
export default FuncWrapper(function ExecuteExtension(
  str: StructureExtension
): void {
  RepairIfDamagedStructure(str);
  TryToCreateTransferJob(str, 100);
});
