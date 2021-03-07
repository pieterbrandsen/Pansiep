import { isUndefined } from "lodash";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetJobById, UpdateJobById, GetJobs } from "../../room/jobs";
import { GetAccesSpotsAroundPosition } from "../../room/reading";

export const IsStructureDamaged = FuncWrapper(function IsStructureDamaged(
  str: Structure
): FunctionReturn {
  return FunctionReturnHelper(FunctionReturnCodes.OK, str.hits < str.hitsMax);
});

export const CreateRepairJob = FuncWrapper(function CreateRepairJob(
  str: Structure,
  jobId: Id<Job>,
  hasPriority = false
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(str.room, str.pos, 2)
    .response;
  const job: Job = {
    id: jobId,
    action: "repair",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 3,
    roomName: str.room.name,
    objId: str.id,
    hasPriority,
    position: { x: str.pos.x, y: str.pos.y },
    energyRequired: (str.hitsMax - str.hits) / 100,
  };
  UpdateJobById(jobId, job, str.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
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

export const CreateWithdrawJob = FuncWrapper(function CreateWithdrawJob(
  str: Structure,
  jobId: Id<Job>,
  energyRequired: number,
  resourceType: ResourceConstant,
  action: JobActionTypes,
  hasPriority = false
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(str.room, str.pos, 1)
    .response;
  const job: Job = {
    id: jobId,
    action,
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots > 1 ? openSpots - 1 : openSpots,
    assignedStructuresIds: [],
    maxStructures: 3,
    roomName: str.room.name,
    objId: str.id,
    hasPriority,
    position: { x: str.pos.x, y: str.pos.y },
    energyRequired,
    resourceType,
  };
  UpdateJobById(jobId, job, str.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
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

export const CreateTransferJob = FuncWrapper(function CreateTransferJob(
  str: Structure,
  jobId: Id<Job>,
  energyRequired: number,
  resourceType: ResourceConstant,
  hasPriority = false,
  action: JobActionTypes
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(str.room, str.pos, 1)
    .response;
  const job: Job = {
    id: jobId,
    action,
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots > 1 ? openSpots - 1 : openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: str.room.name,
    objId: str.id,
    hasPriority,
    position: { x: str.pos.x, y: str.pos.y },
    energyRequired: energyRequired * -1,
    resourceType,
  };
  UpdateJobById(jobId, job, str.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

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

export const CreateUpgradeJob = FuncWrapper(function CreateUpgradeJob(
  room: Room
): FunctionReturn {
  if (isUndefined(room.controller)) {
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  const roomPos: RoomPosition = room.controller.pos;
  const jobId: Id<Job> = `upgrade-${roomPos.x}/${roomPos.y}` as Id<Job>;
  const openSpots: number = GetAccesSpotsAroundPosition(room, roomPos, 2)
    .response;
  const job: Job = {
    id: jobId,
    action: "upgrade",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: room.name,
    objId: room.controller.id,
    hasPriority: false,
    position: { x: roomPos.x, y: roomPos.y },
    energyRequired: 5000,
  };
  UpdateJobById(jobId, job, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const TryToCreateUpgradeJob = FuncWrapper(function TryToCreateUpgradeJob(
  room: Room
): FunctionReturn {
  const jobs: Job[] = GetJobs(room.name, ["build", "dismantle", "upgrade"])
    .response;

  if (jobs.length === 0) {
    CreateUpgradeJob(room);
    return FunctionReturnHelper(FunctionReturnCodes.CREATED);
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});
