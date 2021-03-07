import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import {
  TryToCreateRepairJob,
  TryToCreateWithdrawJob,
  TryToCreateTransferJob,
} from "./helper";

// eslint-disable-next-line
export const ExecuteStorage = FuncWrapper(function ExecuteStorage(
  str: StructureStorage
): FunctionReturn {
  TryToCreateRepairJob(str);
  TryToCreateWithdrawJob(str, 50);
  TryToCreateTransferJob(str, 20);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
