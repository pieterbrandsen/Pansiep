import { isUndefined } from "lodash";
import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import WrapperHandler from "../../utils/wrapper";

import CreepHelper from "../helper";
import CreepActions from "./actionsGroup";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteDismantle(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);
  const structure = UtilsHelper.GetObject(job.objId) as Structure;

  switch (creep.dismantle(structure)) {
    case OK:
      creep.say("Dismantle");
      if (isUndefined(creepMemory.parts[WORK]))
        creepMemory.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyIncome.dismantle +=
        creepMemory.parts[WORK] * 0.25;
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      JobHandler.DeleteJob(job.roomName, job.id);
      break;
    default:
      break;
  }
});
