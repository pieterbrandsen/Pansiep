import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";

export const ExecuteBuild = FuncWrapper(function ExecuteBuild(
  creep: Creep,
  creepMem: CreepMemory,
  job: Job
): FunctionReturn {
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
