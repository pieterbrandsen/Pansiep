import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { TryToCreateUpgradeJob } from "./helper";

// eslint-disable-next-line
export const ExecuteController = FuncWrapper(function ExecuteController(
  str: StructureController
): FunctionReturn {
  TryToCreateUpgradeJob(str.room);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
