import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { TryToCreateRepairJob } from "./helper";

// eslint-disable-next-line
export const ExecuteRoad = FuncWrapper(function ExecuteRoad(
  str: StructureRoad
): FunctionReturn {
  TryToCreateRepairJob(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
