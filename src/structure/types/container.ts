import StructureHelper from "../helper";
import WrapperHandler from "../../utils/wrapper";

/**
 * Execute an container
 */
export default WrapperHandler.FuncWrapper(function ExecuteContainer(
  str: StructureContainer
): void {
  StructureHelper.ControlDamagedStructures(str);
  StructureHelper.ControlStorageOfContainer(str);
});
