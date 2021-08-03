import { isUndefined } from "lodash";
import UtilsHelper from "../../utils/helper";

import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actionsGroup";
import CreepHelper from "../helper";
import StructureHelper from "../../structure/helper";
import WrapperHandler from "../../utils/wrapper";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteRepair(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);
  const structure = UtilsHelper.GetObject(job.objId) as Structure;
  if (!StructureHelper.IsStructureDamaged(structure)) {
    JobHandler.DeleteJob(job.roomName, job.id);
    return;
  }

  switch (creep.repair(structure)) {
    case OK:
      creep.say("Repair");
      if (isUndefined(creepMemory.parts[WORK]))
        creepMemory.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.repair +=
        creepMemory.parts[WORK];
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      JobHandler.AssignNewJobForCreep(
        creep,
        creepMemory.type === "work" || creepMemory.type === "pioneer"
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      );
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      if (structure.room) JobHandler.DeleteJob(job.roomName, job.id);
      else CreepActions.Move(creep, job);
      break;
    default:
      break;
  }
});
