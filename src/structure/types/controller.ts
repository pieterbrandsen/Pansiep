import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an controller
 */
export default WrapperHandler.FuncWrapper(function ExecuteController(
  controller: StructureController
): void {
  StructureHelper.ControlUpgradingOfController(controller);
});
