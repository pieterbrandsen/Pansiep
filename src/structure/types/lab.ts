import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { TryToCreateRepairJob, TryToCreateTransferJob } from "./helper";

// eslint-disable-next-line
export const ExecuteLab = FuncWrapper(function ExecuteLab(
  str: StructureLab
): FunctionReturn {
  TryToCreateRepairJob(str);
  TryToCreateTransferJob(str, 100);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
