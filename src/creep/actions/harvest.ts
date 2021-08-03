import { isUndefined } from "lodash";
import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import WrapperHandler from "../../utils/wrapper";

import CreepHelper from "../helper";
import CreepActions from "./actionsGroup";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteHarvest(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);

  if (creep.store.getFreeCapacity(job.resourceType) === 0) {
    const newJobResult = JobHandler.AssignNewJobForCreep(creep, [
      "transferSource",
    ]);

    if (newJobResult) {
      creepMemory.secondJobId = job.id;
    } else {
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
      JobHandler.AssignNewJobForCreep(creep);
    }
    return;
  }

  const source = UtilsHelper.GetObject(job.objId) as Source;
  switch (creep.harvest(source)) {
    case OK:
      creep.say("harvest");
      if (isUndefined(creepMemory.parts[WORK]))
        creepMemory.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyIncome.harvest +=
        creepMemory.parts[WORK] * 2;
      break;
    case ERR_INVALID_TARGET:
    case ERR_NOT_ENOUGH_RESOURCES:
      if (source === null ||source.room) JobHandler.DeleteJob(job.roomName, job.id);
      else CreepActions.Move(creep, job);
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    default:
      break;
  }
});
