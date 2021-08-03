import { isUndefined } from "lodash";

import UtilsHelper from "../../utils/helper";
import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actionsGroup";
import CreepHelper from "../helper";
import WrapperHandler from "../../utils/wrapper";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteBuild(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);
  const csSite = UtilsHelper.GetObject(job.objId) as ConstructionSite;

  switch (creep.build(csSite)) {
    case OK:
      creep.say("Build");
      if (isUndefined(creepMemory.parts[WORK]))
        creepMemory.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.build +=
        creepMemory.parts[WORK] * 5;
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      JobHandler.AssignNewJobForCreep(
        creep,
        ["work", "pioneer"].includes(creepMemory.type)
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      );
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      if (csSite === null || csSite.room)
        JobHandler.DeleteJob(job.roomName, job.id);
      else CreepActions.Move(creep, job);
      break;
    default:
      break;
  }
});
