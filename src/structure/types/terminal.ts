import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an terminal
 */
export default WrapperHandler.FuncWrapper(function ExecuteTerminal(
  str: StructureTerminal
): void {
  StructureHelper.ControlDamagedStructures(str, true);
  StructureHelper.ControlStorageOfTerminal(str);
});
