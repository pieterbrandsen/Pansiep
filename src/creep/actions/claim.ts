import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import FuncWrapper from "../../utils/wrapper";
import CreepActions from "./actions";

// eslint-disable-next-line
export default FuncWrapper(function ExecuteClaim(
  creep: Creep,
  job: Job
): void {
  const controller = UtilsHelper.GetObject(job.objId) as StructureController;

  switch (creep.claimController(controller)) {
    case OK:
      creep.say("attack");
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      JobHandler.DeleteJob(job.id, job.roomName);
      break;
    case ERR_GCL_NOT_ENOUGH:
      Game.notify("CLAIMING CONTROLLER WHILE GCL IS TOO LOW LEVEL!");
      JobHandler.DeleteJob(job.id, job.roomName);
      break;
    default:
      break;
  }
});
