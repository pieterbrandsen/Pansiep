import { DeleteJobById } from "../../room/jobs";
import { GetObject } from "../../structure/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteDismantle = FuncWrapper(function ExecuteDismantle(
  creep: Creep,
  job: Job
): FunctionReturn {
  const str: Structure = GetObject(job.objId).response as Structure;

  switch (creep.dismantle(str)) {
    case OK:
      creep.say("dismantle");
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
