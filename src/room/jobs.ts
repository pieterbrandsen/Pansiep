import { isUndefined } from "lodash";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FunctionReturnCodes } from "../utils/constants/global";

export const GetAllJobs = FuncWrapper(function GetAllJobs(
  roomName: string,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  const jobs = Memory.rooms[roomName].jobs.filter((j) =>
    filterOnTypes ? filterOnTypes.includes(j.Action) : true
  );
  if (isUndefined(jobs))
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT, []);
  return FunctionReturnHelper(FunctionReturnCodes.OK, jobs);
});

export const GetJobById = FuncWrapper(function GetJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const job: Job = GetAllJobs(roomName).response.find((j) => j.id === id);
  if (isUndefined(job))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, job);
});

export const UpdateJobById = FuncWrapper(function UpdateJobById(
  id: Id<Job>,
  updatedJob: Job,
  roomName: string
): FunctionReturn {
  Memory.rooms[roomName].jobs[id] = updatedJob;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const DeleteJobById = FuncWrapper(function DeleteJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  delete Memory.rooms[roomName].jobs[id];
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddJob = FuncWrapper(function AddJob(
  roomName: string,
  job: Job
): FunctionReturn {
  Memory.rooms[roomName].jobs.push(job);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
