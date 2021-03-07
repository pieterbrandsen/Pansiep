import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";
import {
  AssignNewJobForCreep,
  DeleteJobById,
  UnassignJob,
} from "../../room/jobs";
import { GetObject } from "../../structure/helper";
import { GetCreepMemory } from "../helper";

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
      creep.say("build");
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      UnassignJob(job.id, creep.name, job.roomName);
      AssignNewJobForCreep(
        creep.name,
        creepMem.type === "work" || creepMem.type === "pioneer"
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      );
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
