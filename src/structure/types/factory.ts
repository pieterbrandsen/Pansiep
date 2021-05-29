import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { TryToCreateRepairJob } from "./helper";

// eslint-disable-next-line
export const ExecuteFactory = FuncWrapper(function ExecuteFactory(
  str: StructureFactory
): FunctionReturn {
  TryToCreateRepairJob(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
