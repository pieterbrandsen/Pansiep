import FuncWrapper from "../../utils/wrapper";
import { RepairIfDamagedStructure, TryToCreateTransferJob } from "./helper";

/**
 * Execute an lab
 */
export default FuncWrapper(function ExecuteLab(str: StructureLab): void {
  RepairIfDamagedStructure(str);
  TryToCreateTransferJob(str, 100);
});
