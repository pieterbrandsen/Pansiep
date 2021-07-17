import { isUndefined } from "lodash";
import { DeleteJobById } from "../../room/jobs/handler";
import { GetObject } from "../../utils/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetCreepMemory } from "../helper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteDismantle = FuncWrapper(function ExecuteDismantle(
  creep: Creep,
  job: Job
): FunctionReturn {
  const getCreepMemory = GetCreepMemory(creep.name);
  if (getCreepMemory.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getCreepMemory.code);
  }
  const getObject = GetObject(job.objId);
  if (getObject.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getObject.code);
  }

  const creepMem: CreepMemory = getCreepMemory.response;
  const str: Structure = getObject.response as Structure;

  switch (creep.dismantle(str)) {
    case OK:
      creep.say("Dismantle");
      if (isUndefined(creepMem.parts[WORK]))
        creepMem.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyIncome.dismantle +=
        creepMem.parts[WORK] * 0.25;
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
