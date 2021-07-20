import FuncWrapper from "../../utils/wrapper";
import { RepairIfDamagedStructure } from "./helper";

/**
 * Execute an road
 */
export default FuncWrapper(function ExecuteRoad(str: StructureRoad): void {
  RepairIfDamagedStructure(str);
});
