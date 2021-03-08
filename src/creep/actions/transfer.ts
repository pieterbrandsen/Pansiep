import {
  AssignNewJobForCreep,
  DeleteJobById,
  UnassignJob,
  UpdateJobById,
} from "../../room/jobs";
import { GetObject } from "../../structure/helper";
import { GetFreeCapacity } from "../../structure/types/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetCreepMemory } from "../helper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteTransfer = FuncWrapper(function ExecuteTransfer(
  creep: Creep,
  job: Job
): FunctionReturn {
  const _job = job;
  const creepMem: CreepMemory = GetCreepMemory(creep.name).response;

  if (
    creep.store.getUsedCapacity(job.resourceType) <
    creep.store.getCapacity(job.resourceType) / 10
  ) {
    UnassignJob(job.id, creep.name, job.roomName);
    if (job.action === "transferSource") {
      AssignNewJobForCreep(creep, ["harvest"]);
    } else {
      AssignNewJobForCreep(
        creep,
        creepMem.type === "work" || creepMem.type === "pioneer"
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      );
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  if (_job.energyRequired === undefined || _job.energyRequired <= 0) {
    DeleteJobById(job.id, job.roomName);
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  const resourceType = job.resourceType as ResourceConstant;
  const str: Structure = GetObject(job.objId).response as Structure;

  const strFreeCapacity = GetFreeCapacity(str, resourceType).response;
  const creepUsedCapacity = creep.store.getUsedCapacity(resourceType);
  const transferAmount: number =
    strFreeCapacity > creepUsedCapacity ? creepUsedCapacity : strFreeCapacity;
  switch (creep.transfer(str, resourceType, transferAmount)) {
    case OK:
      creep.say("transfer");
      _job.energyRequired -= transferAmount;
      UpdateJobById(job.id, _job, job.roomName);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      UnassignJob(job.id, creep.name, job.roomName);
      AssignNewJobForCreep(
        creep,
        creepMem.type === "work" || creepMem.type === "pioneer"
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      );
      break;
    case ERR_NOT_IN_RANGE:
      ExecuteMove(creep, job);
      break;
    case ERR_INVALID_TARGET:
    case ERR_FULL:
      DeleteJobById(job.id, job.roomName);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
