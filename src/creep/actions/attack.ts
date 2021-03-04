import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";

export const ExecuteAttack = FuncWrapper(function ExecuteAttack(
  creep: Creep,
  creepMem: CreepMemory,
  job: Job
): FunctionReturn {
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
