import { isUndefined } from "lodash";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FunctionReturnCodes } from "../utils/constants/global";

export const GetAllJobs = FuncWrapper(function GetAllJobs(
  roomName: string,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  const jobs = Memory.rooms[roomName].jobs.filter((j) =>
    filterOnTypes ? filterOnTypes.includes(j.action) : true
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
  const index = Memory.rooms[roomName].jobs.findIndex((j) => j.id === id);
  Memory.rooms[roomName].jobs.splice(index, 1);
  console.log(Memory.rooms[roomName].jobs.splice(index, 1).length)
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
