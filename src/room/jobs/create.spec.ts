import { forEach } from "lodash";
import { mockInstanceOf, mockGlobal } from "screeps-jest";

import MemoryInitializationHandler from "../../memory/initialization";
import RoomHelper from "../helper";
import JobHandler from "./handler";

jest.mock("../../utils/logger");
jest.mock("../planner/planner");

const roomName = "room0";
const creepId = "creep0";
const structureId = "structure0" as Id<Structure>;
const structureType = STRUCTURE_EXTENSION;
const jobPos = new RoomPosition(25, 25, roomName);
const jobActionType: JobActionTypes = "transfer";
const jobActionType2: JobActionTypes = "withdraw";
const resourceType = RESOURCE_ENERGY;

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  controller: {
    my: true,
    level: 1,
  },
  id: 1,
  lookForAtArea: jest.fn().mockReturnValue([]),
});
const structure = mockInstanceOf<Structure>({
  id: structureId,
  pos: jobPos,
  room,
  structureType,
  hitsMax: 1,
  hits: 1,
});
const creep = mockInstanceOf<Creep>({
  id: creepId,
  name: creepId,
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  room,
  pos: jobPos,
});
const controller = mockInstanceOf<StructureController>({
  id: structureId,
  pos: jobPos,
  room,
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      time: 1001,
      rooms: {
        [roomName]: room,
      },
      structures: {
        [structureId]: structure,
      },
      creeps: {
        [creepId]: creep,
      },
      cpu: {
        getUsed: () => {
          return 1;
        },
      },
      getObjectById: jest.fn().mockReturnValue(structure),
    },
    true
  );
});

describe("CreateJobHandler", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
  });

  it("Should create an build job", () => {
    const buildJobId = JobHandler.CreateJob.GetBuildJobId(jobPos);
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      jobPos,
      structureType
    );
    expect(buildJob.id).toBe(buildJobId);

    const memoryBuildJob = JobHandler.GetJob(buildJob.id, buildJob.roomName);
    expect(memoryBuildJob).not.toBeNull();
    if (memoryBuildJob === null) return;
    forEach(Object.keys(memoryBuildJob), (key) => {
      expect(memoryBuildJob[key]).toEqual(buildJob[key]);
    });
  });

  it("Should create an harvest job", () => {
    const source = mockInstanceOf<Source>({
      room,
      id: "abc",
      pos: jobPos,
    });
    const harvestJobId = JobHandler.CreateJob.GetHarvestJobId(source.pos);
    const harvestJob = JobHandler.CreateJob.CreateHarvestJob(source);
    expect(harvestJob.id).toBe(harvestJobId);

    const memoryHarvestJob = JobHandler.GetJob(
      harvestJob.id,
      harvestJob.roomName
    );
    expect(memoryHarvestJob).not.toBeNull();
    if (memoryHarvestJob === null) return;
    forEach(Object.keys(memoryHarvestJob), (key) => {
      expect(memoryHarvestJob[key]).toEqual(harvestJob[key]);
    });
  });

  it("Should create an heal job", () => {
    const healJobId = JobHandler.CreateJob.GetHealJobId(creepId);
    const healJob = JobHandler.CreateJob.CreateHealJob(creep);
    expect(healJob.id).toBe(healJobId);

    const memoryHealJob = JobHandler.GetJob(healJob.id, healJob.roomName);
    expect(memoryHealJob).not.toBeNull();
    if (memoryHealJob === null) return;
    forEach(Object.keys(memoryHealJob), (key) => {
      expect(memoryHealJob[key]).toEqual(healJob[key]);
    });
  });
  it("Should create an move job without default position", () => {
    const moveJobId = JobHandler.CreateJob.GetMoveJobId(roomName);
    const moveJob = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
    expect(moveJob.id).toBe(moveJobId);

    const memoryMoveJob = JobHandler.GetJob(moveJob.id, moveJob.roomName);
    expect(memoryMoveJob).not.toBeNull();
    if (memoryMoveJob === null) return;
    forEach(Object.keys(memoryMoveJob), (key) => {
      expect(memoryMoveJob[key]).toEqual(moveJob[key]);
    });
  });
  it("Should create an move job with default position", () => {
    const moveJobId = JobHandler.CreateJob.GetMoveJobId(roomName);
    const moveJob = JobHandler.CreateJob.CreateMoveJob(roomName);
    expect(moveJob.id).toBe(moveJobId);

    const memoryMoveJob = JobHandler.GetJob(moveJob.id, moveJob.roomName);
    expect(memoryMoveJob).not.toBeNull();
    if (memoryMoveJob === null) return;
    forEach(Object.keys(memoryMoveJob), (key) => {
      expect(memoryMoveJob[key]).toEqual(moveJob[key]);
    });
  });
  it("Should create an repair job", () => {
    const repairJobId = JobHandler.CreateJob.GetRepairJobId(structure);
    const repairJob = JobHandler.CreateJob.CreateRepairJob(structure);
    expect(repairJob.id).toBe(repairJobId);

    const memoryRepairJob = JobHandler.GetJob(repairJob.id, repairJob.roomName);
    expect(memoryRepairJob).not.toBeNull();
    if (memoryRepairJob === null) return;
    forEach(Object.keys(memoryRepairJob), (key) => {
      expect(memoryRepairJob[key]).toEqual(repairJob[key]);
    });
  });
  it("Should create an transfer job with accesSpots higher then 1", () => {
    const transferJobId = JobHandler.CreateJob.GetTransferJobId(
      jobActionType,
      jobPos,
      resourceType
    );
    const transferJob = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      resourceType,
      jobActionType
    );
    expect(transferJob.id).toBe(transferJobId);
    expect(transferJob.maxCreeps).toBeGreaterThan(1);

    const memoryTransferJob = JobHandler.GetJob(
      transferJob.id,
      transferJob.roomName
    );
    expect(memoryTransferJob).not.toBeNull();
    if (memoryTransferJob === null) return;
    forEach(Object.keys(memoryTransferJob), (key) => {
      expect(memoryTransferJob[key]).toEqual(transferJob[key]);
    });
  });
  it("Should create an transfer job with accesSpots equals 1", () => {
    const funcBackup = RoomHelper.Reader.GetAccesSpotsAroundPosition;
    RoomHelper.Reader.GetAccesSpotsAroundPosition = jest
      .fn()
      .mockReturnValue(1);
    const transferJobId = JobHandler.CreateJob.GetTransferJobId(
      jobActionType,
      jobPos,
      resourceType
    );
    const transferJob = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      resourceType,
      jobActionType
    );
    expect(transferJob.id).toBe(transferJobId);
    expect(transferJob.maxCreeps).toBe(1);

    const memoryTransferJob = JobHandler.GetJob(
      transferJob.id,
      transferJob.roomName
    );
    expect(memoryTransferJob).not.toBeNull();
    if (memoryTransferJob === null) return;
    forEach(Object.keys(memoryTransferJob), (key) => {
      expect(memoryTransferJob[key]).toEqual(transferJob[key]);
    });
    RoomHelper.Reader.GetAccesSpotsAroundPosition = funcBackup;
  });
  it("Should create an upgrade job", () => {
    const upgradeJobId = JobHandler.CreateJob.GetUpgradeJobId(jobPos);
    const upgradeJob = JobHandler.CreateJob.CreateUpgradeJob(controller);
    expect(upgradeJob.id).toBe(upgradeJobId);

    const memoryUpgradeJob = JobHandler.GetJob(
      upgradeJob.id,
      upgradeJob.roomName
    );
    expect(memoryUpgradeJob).not.toBeNull();
    if (memoryUpgradeJob === null) return;
    forEach(Object.keys(memoryUpgradeJob), (key) => {
      expect(memoryUpgradeJob[key]).toEqual(upgradeJob[key]);
    });
  });
  it("Should create an withdraw job with acces points higher then 1", () => {
    const withdrawJobId = JobHandler.CreateJob.GetWithdrawJobId(
      jobActionType,
      jobPos,
      resourceType
    );
    const withdrawJob = JobHandler.CreateJob.CreateWithdrawJob(
      structure,
      100,
      resourceType,
      jobActionType2
    );
    expect(withdrawJob.id).toBe(withdrawJobId);
    expect(withdrawJob.maxCreeps).toBeGreaterThan(1);

    const memoryWithdrawJob = JobHandler.GetJob(
      withdrawJob.id,
      withdrawJob.roomName
    );
    expect(memoryWithdrawJob).not.toBeNull();
    if (memoryWithdrawJob === null) return;
    forEach(Object.keys(memoryWithdrawJob), (key) => {
      expect(memoryWithdrawJob[key]).toEqual(withdrawJob[key]);
    });
  });
  it("Should create an withdraw job with acces points equals 1", () => {
    const funcBackup = RoomHelper.Reader.GetAccesSpotsAroundPosition;
    RoomHelper.Reader.GetAccesSpotsAroundPosition = jest
      .fn()
      .mockReturnValue(1);
    const withdrawJobId = JobHandler.CreateJob.GetWithdrawJobId(
      jobActionType,
      jobPos,
      resourceType
    );
    const withdrawJob = JobHandler.CreateJob.CreateWithdrawJob(
      structure,
      100,
      resourceType,
      jobActionType2
    );
    expect(withdrawJob.id).toBe(withdrawJobId);
    expect(withdrawJob.maxCreeps).toBe(1);

    const memoryWithdrawJob = JobHandler.GetJob(
      withdrawJob.id,
      withdrawJob.roomName
    );
    expect(memoryWithdrawJob).not.toBeNull();
    if (memoryWithdrawJob === null) return;
    forEach(Object.keys(memoryWithdrawJob), (key) => {
      expect(memoryWithdrawJob[key]).toEqual(withdrawJob[key]);
    });
    RoomHelper.Reader.GetAccesSpotsAroundPosition = funcBackup;
  });
  it("Should create an claim job with acces points equals 1", () => {
    const claimJobId = JobHandler.CreateJob.GetClaimJobId(roomName);
    const claimJob = JobHandler.CreateJob.CreateClaimJob(room, controller);
    expect(claimJob.id).toBe(claimJobId);

    const memoryClaimJob = JobHandler.GetJob(claimJob.id, claimJob.roomName);
    expect(memoryClaimJob).not.toBeNull();
    if (memoryClaimJob === null) return;
    forEach(Object.keys(memoryClaimJob), (key) => {
      expect(memoryClaimJob[key]).toEqual(claimJob[key]);
    });
  });

  it("Should create an attack job with acces points equals 1", () => {
    const attackJobId = JobHandler.CreateJob.GetAttackJobId(creepId);
    const attackJob = JobHandler.CreateJob.CreateAttackJob(room.name, creep.id);
    expect(attackJob.id).toBe(attackJobId);

    const memoryAttackJob = JobHandler.GetJob(attackJob.id, attackJob.roomName);
    expect(memoryAttackJob).not.toBeNull();
    if (memoryAttackJob === null) return;
    forEach(Object.keys(memoryAttackJob), (key) => {
      expect(memoryAttackJob[key]).toEqual(attackJob[key]);
    });
  });
});
