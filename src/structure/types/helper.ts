import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";

/**
 * Send in an structure and return if the hit points is lower than the maximum.
 */
export const IsStructureDamaged = FuncWrapper(function IsStructureDamaged(
  str: Structure
): boolean {
  return str.hits < str.hitsMax;
});

/**
 * Create an repair job for inputted structure if its damaged.
 */
export const RepairIfDamagedStructure = FuncWrapper(
  function RepairIfDamagedStructure(str: Structure): boolean {
    const jobId: Id<Job> = `repair-${str.pos.x}/${str.pos.x}-${str.structureType}` as Id<Job>;
    const isStructureDamaged = IsStructureDamaged(str);

    const getJobById = JobHandler.GetJob(jobId, str.room.name);
    if (isStructureDamaged && getJobById === null) {
      JobHandler.CreateJob.CreateRepairJob(str, jobId);
    }
    return true;
  }
);

/**
 * Return structure capacity.
 */
export const GetCapacity = FuncWrapper(function GetCapacity(
  str: Structure,
  resourceType: ResourceConstant
): number {
  const capacity = (str as StructureStorage).store.getCapacity(resourceType);
  return capacity;
});

/**
 * Return structure free capacity.
 */
export const GetFreeCapacity = FuncWrapper(function GetFreeCapacity(
  str: Structure,
  resourceType: ResourceConstant
): number {
  const freeCapacity = (str as StructureStorage).store.getFreeCapacity(
    resourceType
  );
  return freeCapacity;
});

/**
 * Return structure used capacity.
 */
export const GetUsedCapacity = FuncWrapper(function GetUsedCapacity(
  str: Structure,
  resourceType: ResourceConstant
): number {
  const usedCapacity = (str as StructureStorage).store.getUsedCapacity(
    resourceType
  );
  return usedCapacity;
});

/**
 * Return if the used capacity is higher inputted {requiredPercentageFull}.
 */
export const IsStructureFullEnough = FuncWrapper(function IsStructureFullEnough(
  str: Structure,
  requiredPercentageFull: number,
  resourceType: ResourceConstant
): { hasOverflow: boolean; overflowAmount: number } {
  const resourceCount: number = GetUsedCapacity(str, resourceType);
  const capacity: number = GetCapacity(str, resourceType);
  const percentageFull = (resourceCount / capacity) * 100;
  const overflowAmount =
    (percentageFull - requiredPercentageFull) * (capacity / 100);
  return {
    hasOverflow:
      percentageFull < 100 ? percentageFull > requiredPercentageFull : true,
    overflowAmount,
  };
});

/**
 * Create withdraw job if resource count is higher then required.
 */
export const TryToCreateWithdrawJob = FuncWrapper(
  function TryToCreateWithdrawJob(
    str: Structure,
    requiredPercentageFull: number,
    resourceType: ResourceConstant = RESOURCE_ENERGY,
    action: JobActionTypes = "withdraw"
  ): void {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const isStructureFullEnough = IsStructureFullEnough(
      str,
      requiredPercentageFull,
      resourceType
    );
    const job = JobHandler.GetJob(jobId, str.room.name);
    if (isStructureFullEnough.hasOverflow === true && job === null) {
      JobHandler.CreateJob.CreateWithdrawJob(
        str,
        jobId,
        isStructureFullEnough.overflowAmount,
        resourceType,
        action,
        false
      );
    }
  }
);

/**
 * Create transfer job if resource count is lower then required.
 */
export const TryToCreateTransferJob = FuncWrapper(
  function TryToCreateTransferJob(
    str: Structure,
    requiredPercentageFull: number,
    resourceType: ResourceConstant = RESOURCE_ENERGY,
    hasPriority = false,
    action: JobActionTypes = "transfer"
  ): void {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const isStructureFullEnough = IsStructureFullEnough(
      str,
      requiredPercentageFull,
      resourceType
    );

    const job = JobHandler.GetJob(jobId, str.room.name);
    if (isStructureFullEnough.hasOverflow === false && job === null) {
      JobHandler.CreateJob.CreateTransferJob(
        str,
        jobId,
        isStructureFullEnough.overflowAmount,
        resourceType,
        hasPriority,
        action
      );
    }
  }
);
