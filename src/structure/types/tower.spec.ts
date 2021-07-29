import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
import RoomHelper from "../../room/helper";

const roomName = "room";
const towerId = "tower" as Id<Structure>;
const creepName = "creep";
const position = new RoomPosition(1, 1, roomName);

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
});
const tower = mockInstanceOf<StructureTower>({
  id: towerId,
  room,
  hits: 99,
  hitsMax: 100,
  structureType: STRUCTURE_TOWER,
  pos: position,
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  room,
  name: creepName,
  pos: position,
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      rooms: { [roomName]: room },
      structures: {
        [towerId]: tower,
      },
    },
    true
  );
  MemoryInitializationHandler.InitializeGlobalMemory();
});

jest.mock("../../room/planner/planner");
jest.mock("../../utils/logger");

describe("TowerHandler", () => {
  describe("ExecuteTower", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, towerId);
      jest.spyOn(StructureHelper, "KeepStructureFullEnough").mockReturnValue();
      jest.spyOn(StructureHelper, "ControlDamagedStructures").mockReturnValue();
    });
    it("should call all main functions", () => {
      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
        tower,
        true
      );
      expect(StructureHelper.KeepStructureFullEnough).toHaveBeenCalledWith(
        tower,
        100,
        RESOURCE_ENERGY,
        "transfer",
        true
      );
    });
    it("should all towerJobActions if it gets executed", () => {
      tower.attack = jest.fn().mockReturnValue(0);
      tower.heal = jest.fn().mockReturnValue(0);
      tower.repair = jest.fn().mockReturnValue(0);

      let structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = "a";
      const attackJob = JobHandler.CreateJob.CreateAttackJob(
        roomName,
        tower.id
      );
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      StructureActions.TowerHandler.ExecuteTower(tower);
      JobHandler.DeleteJob(roomName, attackJob.id);
      expect(tower.attack).toHaveBeenCalled();

      structureMemory.jobId = "a";
      const healJob = JobHandler.CreateJob.CreateHealJob(creep);
      Game.getObjectById = jest.fn().mockReturnValue(creep);
      StructureActions.TowerHandler.ExecuteTower(tower);
      JobHandler.DeleteJob(roomName, healJob.id);
      expect(tower.heal).toHaveBeenCalled();

      structureMemory.jobId = "a";
      RoomHelper.Reader.GetAccesSpotsAroundPosition = jest
        .fn()
        .mockReturnValue(100);
      const repairJob = JobHandler.CreateJob.CreateRepairJob(tower);
      structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = repairJob.id;
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      StructureActions.TowerHandler.ExecuteTower(tower);

      repairJob.action = "move";
      StructureActions.TowerHandler.ExecuteTower(tower);
      JobHandler.DeleteJob(roomName, repairJob.id);
      expect(tower.repair).toHaveBeenCalled();
    });
  });
  describe("ExecuteTowerAttack", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, towerId);
    });
    it("should call tower.attack and delete job", () => {
      tower.attack = jest.fn().mockReturnValue(-7);
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      const job = JobHandler.CreateJob.CreateAttackJob(roomName, tower.id);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.attack).toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(0);
    });
    it("should call tower.attack and default switch", () => {
      tower.attack = jest.fn().mockReturnValue(99);
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      const job = JobHandler.CreateJob.CreateAttackJob(roomName, tower.id);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.attack).toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
    });
  });
  describe("ExecuteTowerHeal", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, towerId);
    });
    it("should call tower.heal and delete job", () => {
      tower.heal = jest.fn().mockReturnValue(-7);
      Game.getObjectById = jest.fn().mockReturnValue(creep);
      const job = JobHandler.CreateJob.CreateHealJob(creep);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.heal).toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(0);
    });
    it("should call tower.attack and default switch", () => {
      tower.heal = jest.fn().mockReturnValue(99);
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      const job = JobHandler.CreateJob.CreateHealJob(creep);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.heal).toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
    });
  });
  describe("ExecuteTowerRepair", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, towerId);
    });
    it("should delete repair job because structure is not damaged anymore", () => {
      const nonDamagedStructure = mockInstanceOf<StructureTower>({
        id: towerId,
        room,
        hits: 100,
        hitsMax: 100,
        structureType: STRUCTURE_TOWER,
        pos: position,
      });
      nonDamagedStructure.hits = 100;
      tower.repair = jest.fn().mockReturnValue(-7);
      Game.getObjectById = jest.fn().mockReturnValue(nonDamagedStructure);
      const job = JobHandler.CreateJob.CreateRepairJob(nonDamagedStructure);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.repair).not.toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(0);
    });
    it("should call tower.repair and delete job", () => {
      tower.repair = jest.fn().mockReturnValue(-7);
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      const job = JobHandler.CreateJob.CreateRepairJob(tower);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.repair).toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(0);
    });
    it("should call tower.repair and default switch", () => {
      tower.repair = jest.fn().mockReturnValue(99);
      Game.getObjectById = jest.fn().mockReturnValue(tower);
      const job = JobHandler.CreateJob.CreateRepairJob(tower);
      const structureMemory = StructureHelper.GetStructureMemory(towerId);
      structureMemory.jobId = job.id;

      StructureActions.TowerHandler.ExecuteTower(tower);
      expect(tower.repair).toHaveBeenCalled();
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
    });
  });
});
