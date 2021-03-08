import {
  UnassignJob,
  AssignNewJobForCreep,
  DeleteJobById,
} from "../../room/jobs";
import { GetObject } from "../../structure/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteHarvest = FuncWrapper(function ExecuteHarvest(
  creep: Creep,
  job: Job
): FunctionReturn {
  if (creep.store.getFreeCapacity(job.resourceType) === 0) {
    UnassignJob(job.id, creep.name, job.roomName);
    const assignNewJobForCreepCode = AssignNewJobForCreep(creep, [
      "transferSource",
    ]).code;
    if (assignNewJobForCreepCode === FunctionReturnCodes.NOT_MODIFIED) {
      AssignNewJobForCreep(creep);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  const source: Source = GetObject(job.objId).response as Source;

  switch (creep.harvest(source)) {
    case OK:
      creep.say("harvest");
      break;
    case ERR_INVALID_TARGET:
    case ERR_NOT_ENOUGH_RESOURCES:
      DeleteJobById(job.id, job.roomName);
      break;
    case ERR_NOT_IN_RANGE:
  ExecuteMove(creep, job);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
