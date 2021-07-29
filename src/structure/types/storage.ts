import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

/**
 * Execute an storage
 */
export default WrapperHandler.FuncWrapper(function ExecuteStorage(
  str: StructureStorage
): void {
  StructureHelper.ControlDamagedStructures(str, true);
  StructureHelper.ControlStorageOfStorage(str);
});
