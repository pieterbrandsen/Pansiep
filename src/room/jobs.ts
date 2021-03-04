import { isUndefined, first } from "lodash";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FunctionReturnCodes } from "../utils/constants/global";

export const GetJobs = FuncWrapper(function GetJobs(
  roomName: string,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  let jobs = Memory.rooms[roomName].jobs.filter((j) =>
    filterOnTypes ? filterOnTypes.includes(j.action) : true
  );
  if (isUndefined(jobs))
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT, []);

  jobs = jobs.sort((a, b) => {
    return Number(a.hasPriority) - Number(b.hasPriority);
  });
  return FunctionReturnHelper(FunctionReturnCodes.OK, jobs);
});

export const AssignNewJob = FuncWrapper(function AssignNewJob(
  creepId: string
): FunctionReturn {
  const creepMem = Memory.creeps[creepId];
  const creepType = creepMem.type;
  let jobs: Job[] = [];
  switch (creepType) {
    case "attack":
      jobs = GetJobs(creepMem.commandRoom, ["attack"]).response;
      break;
    case "claim":
      jobs = GetJobs(creepMem.commandRoom, ["claim"]).response;
      break;
    case "heal":
      jobs = GetJobs(creepMem.commandRoom, ["heal"]).response;
      break;
    case "move":
      jobs = GetJobs(creepMem.commandRoom, ["move"]).response;
      break;
    case "pioneer":
      jobs = GetJobs(creepMem.commandRoom, [
        "transfer",
        "withdraw",
        "harvest",
        "build",
        "repair",
        "dismantle",
        "upgrade",
      ]).response;
      break;
    case "transferring":
      jobs = GetJobs(creepMem.commandRoom, ["transfer", "withdraw"]).response;
      break;
    case "work":
      jobs = GetJobs(creepMem.commandRoom, [
        "harvest",
        "build",
        "repair",
        "dismantle",
        "upgrade",
      ]).response;
      break;
    default:
      break;
  }

  const firstJob: Job | undefined = first(jobs);
  if (firstJob) {
    firstJob.assignedCreepsIds.push(creepId);
    creepMem.jobId = firstJob.id;
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});

export const GetJobById = FuncWrapper(function GetJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const job: Job = GetJobs(roomName).response.find((j) => j.id === id);
  if (isUndefined(job))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, job);
});

export const UpdateJobById = FuncWrapper(function UpdateJobById(
  id: Id<Job>,
  job: Job,
  roomName: string
): FunctionReturn {
  const jobsMem = Memory.rooms[roomName].jobs;
  const index = jobsMem.findIndex((j) => j.id === id);
  if (index >= 0) {
    jobsMem[index] = job;
  } else {
    jobsMem.push(job);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const DeleteJobById = FuncWrapper(function DeleteJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const jobs: Job[] = GetJobs(roomName).response;
  const index = jobs.findIndex((j) => j.id === id);
  jobs.splice(index, 1);
  for (let i = 0; i < jobs.length; i += 1) {
    const job = jobs[i];
    if (job.linkedJobId === id) delete jobs[i].linkedJobId;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
