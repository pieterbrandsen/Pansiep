import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { DeleteJobById, GetAllJobs, GetJobById } from "../../room/jobs/handler";
import {
  CreateRepairJob,
  CreateWithdrawJob,
  CreateTransferJob,
  CreateUpgradeJob,
} from "../../room/jobs/create";

/**
 * Send in an structure and return if the hit points is lower than the maximum.
 *
 * @param {Structure} str - An structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const IsStructureDamaged = FuncWrapper(function IsStructureDamaged(
  str: Structure
): FunctionReturn {
  return FunctionReturnHelper(FunctionReturnCodes.OK, str.hits < str.hitsMax);
});

/**
 * Create an repair job for inputted structure if its damaged.
 *
 * @param {Structure} str - An structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const RepairIfDamagedStructure = FuncWrapper(
  function TryToCreateRepairJob(str: Structure): FunctionReturn {
    const jobId: Id<Job> = `repair-${str.pos.x}/${str.pos.x}-${str.structureType}` as Id<Job>;
    const isStructureDamaged = IsStructureDamaged(str);
    if (isStructureDamaged.code !== FunctionReturnCodes.OK) {
      return FunctionReturnHelper(isStructureDamaged.code);
    }

    const getJobById = GetJobById(jobId, str.room.name);
    if (
      isStructureDamaged.response &&
      getJobById.code === FunctionReturnCodes.NOT_FOUND
    ) {
      CreateRepairJob(str, jobId);
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

/**
 * Return structure capacity.
 *
 * @param {Structure} str - Structure
 * @param {ResourceConstant} resourceType - An resourceType
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetCapacity = FuncWrapper(function GetCapacity(
  str: Structure,
  resourceType: ResourceConstant
): FunctionReturn {
  const capacity = (str as StructureStorage).store.getCapacity(resourceType);
  return FunctionReturnHelper(FunctionReturnCodes.OK, capacity);
});

/**
 * Return structure free capacity.
 *
 * @param {Structure} str - Structure
 * @param {ResourceConstant} resourceType - An resourceType
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetFreeCapacity = FuncWrapper(function GetFreeCapacity(
  str: Structure,
  resourceType: ResourceConstant
): FunctionReturn {
  const freeCapacity = (str as StructureStorage).store.getFreeCapacity(
    resourceType
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK, freeCapacity);
});

/**
 * Return structure used capacity.
 *
 * @param {Structure} str - Structure
 * @param {ResourceConstant} resourceType - An resourceType
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetUsedCapacity = FuncWrapper(function GetUsedCapacity(
  str: Structure,
  resourceType: ResourceConstant
): FunctionReturn {
  const usedCapacity = (str as StructureStorage).store.getUsedCapacity(
    resourceType
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK, usedCapacity);
});

/**
 * Return if the used capacity is higher inputted {requiredPercentageFull}.
 *
 * @param {StructureContainer} str - Container structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const IsStructureFullEnough = FuncWrapper(function IsStructureFullEnough(
  str: Structure,
  requiredPercentageFull: number,
  resourceType: ResourceConstant
): FunctionReturn {
  const resourceCount: number = GetUsedCapacity(str, resourceType).response;
  const capacity: number = GetCapacity(str, resourceType).response;
  const percentageFull = (resourceCount / capacity) * 100;
  const overflowAmount =
    (percentageFull - requiredPercentageFull) * (capacity / 100);
  return FunctionReturnHelper(FunctionReturnCodes.OK, {
    hasOverflow:
      percentageFull < 100 ? percentageFull > requiredPercentageFull : true,
    overflowAmount,
  });
});

/**
 * Create withdraw job if resource count is higher then required.
 *
 * @param {Structure} str - Container
 * @param {number} requiredPercentageFull - Percentage of resource count to be left in structure after withdrawing.
 * @param {ResourceConstant} [resourceType] - Container structure
 * @param {JobActionTypes} [action] - Job action type
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const TryToCreateWithdrawJob = FuncWrapper(
  function TryToCreateWithdrawJob(
    str: Structure,
    requiredPercentageFull: number,
    resourceType: ResourceConstant = RESOURCE_ENERGY,
    action: JobActionTypes = "withdraw"
  ): FunctionReturn {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const isStructureFullEnough = IsStructureFullEnough(
      str,
      requiredPercentageFull,
      resourceType
    );
    if (isStructureFullEnough.code !== FunctionReturnCodes.NOT_FOUND)
      return FunctionReturnHelper(isStructureFullEnough.code);

    const getJobById = GetJobById(jobId, str.room.name);
    if (
      isStructureFullEnough.response.hasOverflow === true &&
      getJobById.code === FunctionReturnCodes.NOT_FOUND
    ) {
      CreateWithdrawJob(
        str,
        jobId,
        isStructureFullEnough.response.overflowAmount,
        resourceType,
        action,
        false
      );
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

/**
 * Create transfer job if resource count is lower then required.
 *
 * @param {Structure} str - Container
 * @param {number} requiredPercentageFull - Percentage of resource count to be transferred into structure.
 * @param {ResourceConstant} [resourceType] - Container structure
 * @param {boolean} [hasPriority] - Gets max priority of all jobs
 * @param {JobActionTypes} [action] - Job action type
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const TryToCreateTransferJob = FuncWrapper(
  function TryToCreateTransferJob(
    str: Structure,
    requiredPercentageFull: number,
    resourceType: ResourceConstant = RESOURCE_ENERGY,
    hasPriority = false,
    action: JobActionTypes = "transfer"
  ): FunctionReturn {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const isStructureFullEnough = IsStructureFullEnough(
      str,
      requiredPercentageFull,
      resourceType
    );
    if (isStructureFullEnough.code !== FunctionReturnCodes.NOT_FOUND)
      return FunctionReturnHelper(isStructureFullEnough.code);

    const getJobById = GetJobById(jobId, str.room.name);
    if (
      isStructureFullEnough.response.hasOverflow === false &&
      getJobById.code === FunctionReturnCodes.NOT_FOUND
    ) {
      CreateTransferJob(
        str,
        jobId,
        isStructureFullEnough.response.overflowAmount,
        resourceType,
        hasPriority,
        action
      );
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

/**
 * Create upgrade job if there is not yet any or controller is near downgrade.
 *
 * @param {Room} room - Room object
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const TryToCreateUpgradeJob = FuncWrapper(function TryToCreateUpgradeJob(
  room: Room
): FunctionReturn {
  const getAllJJobs = GetAllJobs(room.name, ["build", "dismantle", "upgrade"]);
  const spendJobs: Job[] = getAllJJobs.response;
  const upgradeJobs: Job[] = spendJobs.filter((j) => j.action === "upgrade");

  if (upgradeJobs.length === 0) {
    CreateUpgradeJob(room, true);
  } else if (spendJobs.length === 0) {
    CreateUpgradeJob(room);
    return FunctionReturnHelper(FunctionReturnCodes.CREATED);
  } else if (
    (room.controller as StructureController).ticksToDowngrade <
    10 * 1000
  ) {
    const deleteJobById = DeleteJobById(spendJobs[0].id, room.name);
    if (deleteJobById.code === FunctionReturnCodes.OK) {
      CreateUpgradeJob(room, true);
    }
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});
