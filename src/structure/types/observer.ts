import FuncWrapper from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an observer
 */
export default FuncWrapper(function ExecuteObserver(
  str: StructureObserver
): void {
  RepairIfDamagedStructure(str);
});
