import FuncWrapper from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an nuker
 */
export default FuncWrapper(function ExecuteNuker(str: StructureNuker): void {
  RepairIfDamagedStructure(str);
});
