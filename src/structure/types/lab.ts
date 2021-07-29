import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an lab
 */
export default WrapperHandler.FuncWrapper(function ExecuteLab(
  str: StructureLab
): void {
  StructureHelper.ControlDamagedStructures(str);
  StructureHelper.KeepStructureFullEnough(str, 100, RESOURCE_ENERGY);
});
