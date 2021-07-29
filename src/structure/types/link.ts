import StructureHelper from "../helper";
import WrapperHandler from "../../utils/wrapper";

/**
 * Execute an link
 */
export default WrapperHandler.FuncWrapper(function ExecuteLink(
  str: StructureLink
): void {
  StructureHelper.ControlDamagedStructures(str);
  StructureHelper.ControlStorageOfLink(str);
});
