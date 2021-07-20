import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an controller
 */
export default FuncWrapper(function ExecuteController(
  controller: StructureController
): void {
  StructureHelper.ControlUpgradingOfController(controller);
});
