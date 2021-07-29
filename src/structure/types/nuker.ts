import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an nuker
 */
export default WrapperHandler.FuncWrapper(function ExecuteNuker(
  str: StructureNuker
): void {
  StructureHelper.ControlDamagedStructures(str);
});
