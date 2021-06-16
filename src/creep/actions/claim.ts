import { DeleteJobById } from "../../room/jobs/handler";
import { GetObject } from "../../utils/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteClaim = FuncWrapper(function ExecuteClaim(
  creep: Creep,
  job: Job
): FunctionReturn {
  const controller: StructureController = GetObject(job.objId)
    .response as StructureController;

  switch (creep.claimController(controller)) {
    case OK:
      creep.say("attack");
      break;
    case ERR_NOT_IN_RANGE:
      ExecuteMove(creep, job);
      break;
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, job.roomName);
      break;
    case ERR_GCL_NOT_ENOUGH:
      Game.notify("CLAIMING GCL WHILE TOO LOW LEVEL!");
      DeleteJobById(job.id, job.roomName);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
