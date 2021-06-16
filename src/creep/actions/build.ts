import { isUndefined } from "lodash";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";
import {
  AssignNewJobForCreep,
  DeleteJobById,
  UnassignJob,
} from "../../room/jobs/handler";
import { GetCreepMemory } from "../helper";
import { GetObject } from "../../utils/helper";

// eslint-disable-next-line
export const ExecuteBuild = FuncWrapper(function ExecuteBuild(
  creep: Creep,
  job: Job
): FunctionReturn {
  const creepMem: CreepMemory = GetCreepMemory(creep.name).response;
  const csSite: ConstructionSite = GetObject(job.objId)
    .response as ConstructionSite;

  switch (creep.build(csSite)) {
    case OK:
      creep.say("Build");
      if (isUndefined(creepMem.parts[WORK]))
        creepMem.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.build +=
        creepMem.parts[WORK] * 5;
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      if (
        AssignNewJobForCreep(
          creep,
          creepMem.type === "work" || creepMem.type === "pioneer"
            ? ["withdraw", "harvest"]
            : ["withdraw"]
        ).code === FunctionReturnCodes.OK
      )
        UnassignJob(job.id, creep.name, job.roomName);
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
