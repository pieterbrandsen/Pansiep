import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import {
  TryToCreateRepairJob,
  TryToCreateWithdrawJob,
  TryToCreateTransferJob,
} from "./helper";

// eslint-disable-next-line
export const ExecuteTerminal = FuncWrapper(function ExecuteTerminal(
  str: StructureTerminal
): FunctionReturn {
  TryToCreateRepairJob(str);
  TryToCreateWithdrawJob(str, 35);
  TryToCreateTransferJob(str, 20, RESOURCE_ENERGY, true);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
