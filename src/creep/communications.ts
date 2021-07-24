import JobHandler from "../room/jobs/handler";
import GlobalConstants from "../utils/constants/global";
import FunctionReturnHelper from "../utils/functionStatusGenerator";
import WrapperHandler from "../utils/wrapper";
import CreepHelper from "./helper";

export default class CreepCommunication {
  public static GetCurrentJob = WrapperHandler.FuncWrapper(
    function CreepGetCurrentJob(creepName: string): FunctionReturn {
      try {
        const creepMemory = CreepHelper.GetCreepMemory(creepName);
        if (creepMemory === null || creepMemory.jobId === undefined) {
          return FunctionReturnHelper(
            GlobalConstants.FunctionReturnCodes.NOT_FOUND
          );
        }

        const job = JobHandler.GetJob(
          creepMemory.jobId,
          creepMemory.commandRoom
        );
        if (job === null) {
          return FunctionReturnHelper(
            GlobalConstants.FunctionReturnCodes.NOT_FOUND
          );
        }

        return FunctionReturnHelper(
          GlobalConstants.FunctionReturnCodes.OK,
          job
        );
      } catch (error) {
        return FunctionReturnHelper(
          GlobalConstants.FunctionReturnCodes.INTERNAL_SERVER_ERROR,
          error
        );
      }
    }
  );
}
