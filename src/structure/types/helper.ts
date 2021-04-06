import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetAllJobs, GetJobById } from "../../room/jobs/handler";
import {
  CreateRepairJob,
  CreateWithdrawJob,
  CreateTransferJob,
  CreateUpgradeJob,
} from "../../room/jobs/create";

export const IsStructureDamaged = FuncWrapper(function IsStructureDamaged(
  str: Structure
): FunctionReturn {
  return FunctionReturnHelper(FunctionReturnCodes.OK, str.hits < str.hitsMax);
});

export const TryToCreateRepairJob = FuncWrapper(function TryToCreateRepairJob(
  str: Structure
): FunctionReturn {
  const jobId: Id<Job> = `repair-${str.pos.x}/${str.pos.x}-${str.structureType}` as Id<Job>;
  if (
    IsStructureDamaged(str).response &&
    GetJobById(jobId, str.room.name).code === FunctionReturnCodes.NOT_FOUND
  ) {
    CreateRepairJob(str, jobId);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetCapacity = FuncWrapper(function GetCapacity(
  str: Structure,
  resourceType: ResourceConstant
): FunctionReturn {
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    (str as StructureStorage).store.getCapacity(resourceType)
  );
});

export const GetFreeCapacity = FuncWrapper(function GetFreeCapacity(
  str: Structure,
  resourceType: ResourceConstant
): FunctionReturn {
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    (str as StructureStorage).store.getFreeCapacity(resourceType)
  );
});

export const GetUsedCapacity = FuncWrapper(function GetUsedCapacity(
  str: Structure,
  resourceType: ResourceConstant
): FunctionReturn {
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    (str as StructureStorage).store.getUsedCapacity(resourceType)
  );
});

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

export const TryToCreateWithdrawJob = FuncWrapper(
  function TryToCreateWithdrawJob(
    str: Structure,
    requiredPercentageFull: number,
    resourceType: ResourceConstant = RESOURCE_ENERGY,
    action: JobActionTypes = "withdraw"
  ): FunctionReturn {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const isStructureFullEnough: {
      hasOverflow: boolean;
      overflowAmount: number;
    } = IsStructureFullEnough(str, requiredPercentageFull, resourceType)
      .response;
    if (
      isStructureFullEnough.hasOverflow &&
      GetJobById(jobId, str.room.name).code === FunctionReturnCodes.NOT_FOUND
    ) {
      CreateWithdrawJob(
        str,
        jobId,
        isStructureFullEnough.overflowAmount,
        resourceType,
        action,
        false
      );
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const TryToCreateTransferJob = FuncWrapper(
  function TryToCreateTransferJob(
    str: Structure,
    requiredPercentageFull: number,
    resourceType: ResourceConstant = RESOURCE_ENERGY,
    hasPriority = false,
    action: JobActionTypes = "transfer"
  ): FunctionReturn {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const isStructureFullEnough: {
      hasOverflow: boolean;
      overflowAmount: number;
    } = IsStructureFullEnough(str, requiredPercentageFull, resourceType)
      .response;

    if (
      !isStructureFullEnough.hasOverflow &&
      GetJobById(jobId, str.room.name).code === FunctionReturnCodes.NOT_FOUND
    ) {
      CreateTransferJob(
        str,
        jobId,
        isStructureFullEnough.overflowAmount,
        resourceType,
        hasPriority,
        action
      );
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const TryToCreateUpgradeJob = FuncWrapper(function TryToCreateUpgradeJob(
  room: Room
): FunctionReturn {
  const spendJobs: Job[] = GetAllJobs(room.name, [
    "build",
    "dismantle",
    "upgrade",
  ]).response;
  const upgradeJobs: Job[] = spendJobs.filter((j) => j.action === "upgrade");

  if (
    upgradeJobs.length === 0 &&
    (room.controller as StructureController).ticksToDowngrade < 10 * 1000
  ) {
    CreateUpgradeJob(room, true);
  } else if (spendJobs.length === 0) {
    CreateUpgradeJob(room);
    return FunctionReturnHelper(FunctionReturnCodes.CREATED);
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});
