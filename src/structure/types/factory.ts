import FuncWrapper from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an factory
 */
export default FuncWrapper(function ExecuteFactory(
  str: StructureFactory
): void {
  RepairIfDamagedStructure(str);
});
