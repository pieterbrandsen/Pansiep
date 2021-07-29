import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an factory
 */
export default WrapperHandler.FuncWrapper(function ExecuteFactory(
  str: StructureFactory
): void {
  StructureHelper.ControlDamagedStructures(str);
});
