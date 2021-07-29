import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an road
 */
export default WrapperHandler.FuncWrapper(function ExecuteRoad(
  str: StructureRoad
): void {
  StructureHelper.ControlDamagedStructures(str);
});
