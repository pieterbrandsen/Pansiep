import { isUndefined } from "lodash";
import {
  UnassignJob,
  AssignNewJobForCreep,
  DeleteJobById,
} from "../../room/jobs/handler";
import { GetObject } from "../../utils/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetCreepMemory, UpdateCreepMemory } from "../helper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteHarvest = FuncWrapper(function ExecuteHarvest(
  creep: Creep,
  job: Job
): FunctionReturn {
  const creepMem: CreepMemory = GetCreepMemory(creep.name).response;
  if (creep.store.getFreeCapacity(job.resourceType) === 0) {
    const assignNewJobForCreepCode = AssignNewJobForCreep(creep, [
      "transferSource",
    ]).code;

    if (assignNewJobForCreepCode === FunctionReturnCodes.NO_CONTENT) {
      UnassignJob(job.id, creep.name, job.roomName);
      AssignNewJobForCreep(creep);
    } else {
      creepMem.secondJobId = job.id;
      UpdateCreepMemory(creep.name, creepMem);
    }

    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  const source: Source = GetObject(job.objId).response as Source;

  switch (creep.harvest(source)) {
    case OK:
      creep.say("harvest");
      if (isUndefined(creepMem.parts[WORK]))
        creepMem.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyIncome.harvest +=
        creepMem.parts[WORK] * 2;
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
