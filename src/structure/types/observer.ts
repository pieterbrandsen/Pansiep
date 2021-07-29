import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an observer
 */
export default WrapperHandler.FuncWrapper(function ExecuteObserver(
  str: StructureObserver
): void {
  StructureHelper.ControlDamagedStructures(str);
});
