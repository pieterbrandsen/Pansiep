import { isUndefined } from "lodash";
import {
  DeleteJobById,
  AssignNewJobForCreep,
  UnassignJob,
  UpdateJobById,
  SwitchCreepSavedJobIds,
} from "../../room/jobs/handler";
import { GetUsedCapacity } from "../../structure/types/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";
import { GetCreepMemory } from "../helper";
import { GetObject } from "../../utils/helper";

// eslint-disable-next-line
export const ExecuteWithdraw = FuncWrapper(function ExecuteWithdraw(
  creep: Creep,
  job: Job
): FunctionReturn {
  const _job = job;
  const getCreepMemory = GetCreepMemory(creep.name);
  if (getCreepMemory.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getCreepMemory.code);
  }
  const creepMem: CreepMemory = getCreepMemory.response;
  if (_job.energyRequired === undefined || _job.energyRequired <= 0) {
    DeleteJobById(job.id, job.roomName);
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  const resourceType = job.resourceType as ResourceConstant;
  const getObject = GetObject(job.objId);
  if (getObject.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getObject.code)
  }
  
  const str: Structure = getObject
    .response as Structure;
  const strUsedCapacity = GetUsedCapacity(str, resourceType).response;
  const creepFreeCapacity = creep.store.getFreeCapacity(resourceType);
  const withdrawAmount: number =
    strUsedCapacity > creepFreeCapacity ? creepFreeCapacity : strUsedCapacity;

  switch (creep.withdraw(str, resourceType, withdrawAmount)) {
    case OK:
      creep.say("withdraw");
      _job.energyRequired -= withdrawAmount;
      UpdateJobById(job.id, _job, job.roomName);
      break;
    case ERR_FULL:
      UnassignJob(job.id, creep.name, job.roomName);
      if (isUndefined(creepMem.secondJobId)) {
        AssignNewJobForCreep(
          creep,
          creepMem.type === "transferring" ? ["transfer"] : undefined
        );
      } else {
        SwitchCreepSavedJobIds(creep.name);
      }
      break;
    case ERR_NOT_IN_RANGE:
      ExecuteMove(creep, job);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, job.roomName);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
