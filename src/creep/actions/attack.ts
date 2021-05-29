import { DeleteJobById } from "../../room/jobs/handler";
import { GetObject } from "../../structure/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteAttack = FuncWrapper(function ExecuteAttack(
  creep: Creep,
  job: Job
): FunctionReturn {
  const target: Structure | Creep = GetObject(job.objId).response as
    | Structure
    | Creep;

  switch (creep.attack(target)) {
    case OK:
      creep.say("attack");
      break;
    case ERR_NOT_IN_RANGE:
      ExecuteMove(creep, job);
      break;
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, job.roomName);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
