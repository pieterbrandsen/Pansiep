import {
  GetJobById,
  DeleteJobById,
  AssignNewJobForStructure,
} from "../../room/jobs";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetObject, GetStructureMemory } from "../helper";
import {
  IsStructureDamaged,
  TryToCreateRepairJob,
  TryToCreateTransferJob,
} from "./helper";

export const ExecuteTowerAttack = FuncWrapper(function ExecuteTowerAttack(
  str: StructureTower,
  job: Job
): FunctionReturn {
  const creep: Creep = GetObject(job.objId).response as Creep;
  switch (str.attack(creep)) {
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, str.room.name);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteTowerHeal = FuncWrapper(function ExecuteTowerHeal(
  str: StructureTower,
  job: Job
): FunctionReturn {
  const creep: Creep = GetObject(job.objId).response as Creep;
  switch (str.heal(creep)) {
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, str.room.name);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteTowerRepair = FuncWrapper(function ExecuteTowerRepair(
  str: StructureTower,
  job: Job
): FunctionReturn {
  const targetStr: Structure = GetObject(job.objId).response as Structure;
  if (!IsStructureDamaged(targetStr).response) {
    DeleteJobById(job.id, job.roomName);
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  switch (str.repair(targetStr)) {
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, str.room.name);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetNewTowerJob = FuncWrapper(function GetNewTowerJob(
  str: StructureTower
): FunctionReturn {
  AssignNewJobForStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteTower = FuncWrapper(function ExecuteTower(
  str: StructureTower
): FunctionReturn {
  TryToCreateRepairJob(str);
  TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, true);

  const strMem: StructureMemory = GetStructureMemory(str.id).response;
  if (strMem.jobId) {
    const job: Job = GetJobById(strMem.jobId as Id<Job>, str.room.name)
      .response;
    switch (job.action) {
      case "attack":
        ExecuteTowerAttack(str, job);
        break;
      case "heal":
        ExecuteTowerHeal(str, job);
        break;
      case "repair":
        ExecuteTowerRepair(str, job);
        break;
      default:
        break;
    }
  } else {
    GetNewTowerJob(str);
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
