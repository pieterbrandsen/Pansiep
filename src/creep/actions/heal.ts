import UtilsHelper from "../../utils/helper";
import FuncWrapper from "../../utils/wrapper";
import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actions";
import CreepHelper from "../helper";

// eslint-disable-next-line
export default FuncWrapper(function ExecuteHeal(
  creep: Creep,
  job: Job
): void {
  const targetCreep = UtilsHelper.GetObject(job.objId) as Creep;

  if (job.stopHealingAtMaxHits && !CreepHelper.IsCreepDamaged(creep)) {
    JobHandler.DeleteJob(job.id, job.roomName);
    return;
  }

  switch (creep.heal(targetCreep)) {
    case OK:
      creep.say("heal");
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      JobHandler.DeleteJob(job.id, job.roomName);
      break;
    default:
      break;
  }
});
