import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import FuncWrapper from "../../utils/wrapper";
import CreepActions from "./actions";

// eslint-disable-next-line
export default FuncWrapper(function ExecuteAttack(
  creep: Creep,
  job: Job
): void {
  const target = UtilsHelper.GetObject(job.objId) as Structure | Creep;

  switch (creep.attack(target)) {
    case OK:
      creep.say("attack");
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
