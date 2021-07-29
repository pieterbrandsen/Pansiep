import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an extension
 */
export default WrapperHandler.FuncWrapper(function ExecuteExtension(
  str: StructureExtension
): void {
  StructureHelper.ControlDamagedStructures(str);
  StructureHelper.KeepStructureFullEnough(str, 100, RESOURCE_ENERGY);
});
