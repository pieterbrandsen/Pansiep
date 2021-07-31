import { forEach } from "lodash";
import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../memory/initialization";
import RoomHelper from "../room/helper";
import UtilsHelper from "../utils/helper";
import StructureHelper from "./helper";
import JobHandler from "../room/jobs/handler";

jest.mock("./types/actionsGroup");
jest.mock("../utils/logger");
jest.mock("../room/planner/planner");

const roomName = "room";
const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  createConstructionSite: jest.fn().mockReturnValue(0),
});

const structureId = "structure" as Id<Structure>;
const structure = mockInstanceOf<StructureContainer>({
  id: structureId,
  structureType: STRUCTURE_CONTAINER,
  store: {},
  hits: 0,
  hitsMax: 100,
  pos: new RoomPosition(0, 0, roomName),
  room,
});
const source = mockInstanceOf<Source>({});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      rooms: {
        [roomName]: room,
      },
      structures: {},
      creeps: {},
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
  MemoryInitializationHandler.InitializeGlobalMemory();
  MemoryInitializationHandler.InitializeRoomMemory(roomName);
});

describe("StructureHelper", () => {
  describe("GetStructure", () => {
    it("should return an live structure", () => {
      UtilsHelper.GetObject = jest.fn().mockReturnValue(structure);
      const foundStructure = StructureHelper.GetStructure(structureId);
      expect(foundStructure.id).toBe(structure.id);
    });

    it("should return null if the structure is not found", () => {
      UtilsHelper.GetObject = jest.fn().mockReturnValue(null);
      const foundStructure = StructureHelper.GetStructure(structureId);
      expect(foundStructure).toBe(null);
    });
  });
  describe("IsStructureDamaged", () => {
    it("should return true because hits is lower then max", () => {
      structure.hitsMax = 1;
      structure.hits = 0;
      const isStructureDamaged = StructureHelper.IsStructureDamaged(structure);
      expect(isStructureDamaged).toBe(true);
    });
    it("should return false because hits is equal to max", () => {
      structure.hitsMax = 1;
      structure.hits = 1;
      const isStructureDamaged = StructureHelper.IsStructureDamaged(structure);
      expect(isStructureDamaged).toBe(false);
    });
  });
  describe("GetCapacity", () => {
    it("should return correct capacity of structure", () => {
      const capacity = 10;
      structure.store.getCapacity = jest.fn().mockReturnValue(capacity);
      const getCapacity = StructureHelper.GetCapacity(
        structure,
        RESOURCE_ENERGY
      );
      expect(getCapacity).toBe(capacity);
    });
  });
  describe("GetFreeCapacity", () => {
    it("should return correct free capacity of structure", () => {
      const freeCapacity = 10;
      structure.store.getFreeCapacity = jest.fn().mockReturnValue(freeCapacity);
      const getFreeCapacity = StructureHelper.GetFreeCapacity(
        structure,
        RESOURCE_ENERGY
      );
      expect(getFreeCapacity).toBe(freeCapacity);
    });
  });
  describe("GetUsedCapacity", () => {
    it("should return correct used capacity of structure", () => {
      const usedCapacity = 10;
      structure.store.getUsedCapacity = jest.fn().mockReturnValue(usedCapacity);
      const getUsedCapacity = StructureHelper.GetCapacity(
        structure,
        RESOURCE_ENERGY
      );
      expect(getUsedCapacity).toBe(usedCapacity);
    });
  });
  describe("IsStructureFullEnough", () => {
    it("should return structure is overflowing because used percentage is higher then 0", () => {
      const capacity = 10;
      structure.store.getCapacity = jest.fn().mockReturnValue(capacity);
      const usedCapacity = 1;
      structure.store.getUsedCapacity = jest.fn().mockReturnValue(usedCapacity);
      const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        structure,
        0,
        RESOURCE_ENERGY
      );
      expect(isStructureFullEnough.hasOverflow).toBe(true);
      expect(isStructureFullEnough.overflowAmount).toBe(usedCapacity);
    });
    it("should return structure is not overflowing because used percentage is lower then 100", () => {
      const capacity = 10;
      structure.store.getCapacity = jest.fn().mockReturnValue(capacity);
      const usedCapacity = 10;
      structure.store.getUsedCapacity = jest.fn().mockReturnValue(usedCapacity);
      const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        structure,
        100,
        RESOURCE_ENERGY
      );
      expect(isStructureFullEnough.hasOverflow).toBe(false);
      expect(isStructureFullEnough.overflowAmount).toBe(
        capacity - usedCapacity
      );
    });
  });
  describe("GetStructureMemory", () => {
    it("should return correct memory of structure", () => {
      Memory.structures[structureId] = {
        room: "room",
      };
      const structureMemory = Memory.structures[structureId];
      const getStructureMemory = StructureHelper.GetStructureMemory(
        structureId
      );
      expect(getStructureMemory).toBe(structureMemory);
    });
    it("should return undefined because structure is not in memory", () => {
      Memory.structures = {};
      const getStructureMemory = StructureHelper.GetStructureMemory(
        structureId
      );
      expect(getStructureMemory).toBe(undefined);
    });
  });
  describe("GetAllStructureIds", () => {
    it("should return all structure ids of room", () => {
      const structureIds = ["structure1", "structure2"];
      Memory.cache.structures.data[roomName] = [
        { id: structureIds[0], structureType: "container" },
        { id: structureIds[1], structureType: "container" },
      ];
      const roomStructureIds = StructureHelper.GetAllStructureIds(roomName);
      const room2StructureIds = StructureHelper.GetAllStructureIds(
        "randomRoom"
      );
      expect(roomStructureIds.length).toBe(structureIds.length);
      expect(room2StructureIds.length).toBe(0);
    });
  });
  describe("BuildStructure", () => {
    it("should build structure", () => {
      Memory.rooms[roomName].jobs = [];
      const position = new RoomPosition(1, 1, "roomName");
      const structureType = STRUCTURE_CONTAINER;

      room.createConstructionSite = jest.fn().mockReturnValue(0);
      RoomHelper.Reader.GetAccesSpotsAroundPosition = jest
        .fn()
        .mockReturnValue(0);
      const hasBeenBuild = StructureHelper.BuildStructure(
        room,
        position,
        structureType
      );
      expect(hasBeenBuild).toBe(true);
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
    });
    it("should not build structure", () => {
      Memory.rooms[roomName].jobs = [];
      const position = new RoomPosition(1, 1, "roomName");
      const structureType = STRUCTURE_CONTAINER;

      room.createConstructionSite = jest.fn().mockReturnValue(1);
      const hasBeenBuild = StructureHelper.BuildStructure(
        room,
        position,
        structureType,
        true
      );
      expect(hasBeenBuild).toBe(false);
      expect(Memory.rooms[roomName].jobs.length).toBe(0);
    });
  });
  describe("ExecuteStructure", () => {
    it("should execute all structure types", () => {
      const structureTypes: StructureConstant[] = [
        STRUCTURE_CONTAINER,
        STRUCTURE_CONTROLLER,
        STRUCTURE_EXTENSION,
        STRUCTURE_FACTORY,
        STRUCTURE_LAB,
        STRUCTURE_LINK,
        STRUCTURE_NUKER,
        STRUCTURE_OBSERVER,
        STRUCTURE_SPAWN,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_TOWER,
        STRUCTURE_ROAD,
        STRUCTURE_EXTRACTOR,
      ];

      let i = 0;
      forEach(structureTypes, (structureType) => {
        i += 1;
        const str = mockInstanceOf<Structure>({ structureType });
        StructureHelper.ExecuteStructure(str);
      });
      expect(i).toBe(structureTypes.length);
    });
  });
  describe("ControlStorageOfContainer", () => {
    beforeEach(() => {
      Memory.rooms[room.name].jobs = [];
    });
    it("should control container of controller and expect overflow", () => {
      const controllerContainer = mockInstanceOf<StructureContainer>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerContainer.pos.inRangeTo = jest.fn().mockReturnValue(true);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([]);

      StructureHelper.ControlStorageOfContainer(controllerContainer);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdrawController");
    });
    it("should control container of controller and not expect overflow", () => {
      const controllerContainer = mockInstanceOf<StructureContainer>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerContainer.pos.inRangeTo = jest.fn().mockReturnValue(true);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: false, overflowAmount: 0 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([]);

      StructureHelper.ControlStorageOfContainer(controllerContainer);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("transfer");
    });
    it("should control container of source and expect overflow", () => {
      const controllerContainer = mockInstanceOf<StructureContainer>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerContainer.pos.inRangeTo = jest.fn().mockReturnValue(false);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfContainer(controllerContainer);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdraw");
    });
    it("should control container of source and not expect overflow", () => {
      const controllerContainer = mockInstanceOf<StructureContainer>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerContainer.pos.inRangeTo = jest.fn().mockReturnValue(false);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: false, overflowAmount: 0 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfContainer(controllerContainer);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("transferSource");
      Memory.rooms[room.name].jobs = [];
    });
    it("should control container of nothing", () => {
      const controllerContainer = mockInstanceOf<StructureContainer>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerContainer.pos.inRangeTo = jest.fn().mockReturnValue(false);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([]);

      StructureHelper.ControlStorageOfContainer(controllerContainer);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdraw");
    });
  });
  describe("ControlStorageOfLink", () => {
    beforeEach(() => {
      Memory.rooms[room.name].jobs = [];
    });
    it("should control link of controller and expect overflow", () => {
      const controllerLink = mockInstanceOf<StructureLink>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerLink.pos.inRangeTo = jest.fn().mockReturnValue(true);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([]);

      StructureHelper.ControlStorageOfLink(controllerLink);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdrawController");
    });
    it("should control link of source and expect overflow", () => {
      const controllerLink = mockInstanceOf<StructureLink>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerLink.pos.inRangeTo = jest.fn().mockReturnValue(false);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfLink(controllerLink);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdraw");
    });
    it("should control link of source and not expect overflow", () => {
      const controllerLink = mockInstanceOf<StructureLink>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerLink.pos.inRangeTo = jest.fn().mockReturnValue(false);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: false, overflowAmount: 0 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfLink(controllerLink);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("transferSource");
      Memory.rooms[room.name].jobs = [];
    });
    it("should control link of nothing", () => {
      const controllerLink = mockInstanceOf<StructureLink>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      controllerLink.pos.inRangeTo = jest.fn().mockReturnValue(false);
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([]);
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 0 });

      StructureHelper.ControlStorageOfLink(controllerLink);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdraw");
    });
  });
  describe("ControlStorageOfStorage", () => {
    beforeEach(() => {
      Memory.rooms[room.name].jobs = [];
    });
    it("should control storage and expect overflow", () => {
      const controllerStorage = mockInstanceOf<StructureStorage>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfStorage(controllerStorage);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdraw");
    });
    it("should control storage and not expect overflow", () => {
      const storage = mockInstanceOf<StructureStorage>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: false, overflowAmount: 0 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfStorage(storage);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("transfer");
    });
  });
  describe("ControlStorageOfTerminal", () => {
    beforeEach(() => {
      Memory.rooms[room.name].jobs = [];
    });
    it("should control terminal and expect overflow", () => {
      const terminal = mockInstanceOf<StructureTerminal>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: true, overflowAmount: 10 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfTerminal(terminal);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("withdraw");
    });
    it("should control storage and not expect overflow", () => {
      const terminal = mockInstanceOf<StructureTerminal>({
        id: "a",
        pos: new RoomPosition(1, 1, "roomName"),
        room: {
          name: roomName,
          controller: mockInstanceOf<StructureController>({}),
        },
      });
      StructureHelper.IsStructureFullEnough = jest
        .fn()
        .mockReturnValue({ hasOverflow: false, overflowAmount: 0 });
      RoomHelper.Reader.GetSourcesInRange = jest.fn().mockReturnValue([source]);

      StructureHelper.ControlStorageOfTerminal(terminal);
      expect(Memory.rooms[room.name].jobs[0].action).toBe("transfer");
    });
  });
  describe("ControlUpgradingOfController", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
    });
    it("should add an upgrade job with priority when current job has no priority", () => {
      const controller = mockInstanceOf<StructureController>({
        room,
        id: "a",
        ticksToDowngrade: 1,
        pos: new RoomPosition(2, 1, "roomName"),
      });

      JobHandler.CreateJob.CreateUpgradeJob(controller,false);
      StructureHelper.ControlUpgradingOfController(controller);
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
      expect(Memory.rooms[roomName].jobs[0].action).toBe("upgrade");
      expect(Memory.rooms[roomName].jobs[0].hasPriority).toBe(true);
      StructureHelper.ControlUpgradingOfController(controller);
    });
    it("should add an upgrade job with priority when no job exists", () => {
      const controller = mockInstanceOf<StructureController>({
        room,
        id: "a",
        ticksToDowngrade: 1,
        pos: new RoomPosition(2, 1, "roomName"),
      });

      StructureHelper.ControlUpgradingOfController(controller);
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
      expect(Memory.rooms[roomName].jobs[0].action).toBe("upgrade");
      expect(Memory.rooms[roomName].jobs[0].hasPriority).toBe(true);
    });
    it("should add an upgrade job with no priority", () => {
      const controller = mockInstanceOf<StructureController>({
        room,
        id: "a",
        ticksToDowngrade: 15 * 1000,
        pos: new RoomPosition(2, 1, "roomName"),
      });

      StructureHelper.ControlUpgradingOfController(controller);
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
      expect(Memory.rooms[roomName].jobs[0].action).toBe("upgrade");
      expect(Memory.rooms[roomName].jobs[0].hasPriority).toBe(false);
    });
    it("should remove the upgrade job because build cost is really high", () => {
      const controller = mockInstanceOf<StructureController>({
        room,
        id: "a",
        ticksToDowngrade: 15 * 1000,
        pos: new RoomPosition(2, 1, "roomName"),
      });
      StructureHelper.ControlUpgradingOfController(controller);
      expect(
        Memory.rooms[roomName].jobs.find((j: Job) => j.action === "upgrade")
      ).not.toBeUndefined();

      const job = JobHandler.CreateJob.CreateBuildJob(
        room,
        new RoomPosition(1, 1, "roomName"),
        STRUCTURE_TERMINAL
      );
      job.energyRequired = undefined;
      JobHandler.CreateJob.CreateBuildJob(
        room,
        new RoomPosition(1, 1, "roomName"),
        STRUCTURE_TERMINAL
      );
      StructureHelper.ControlUpgradingOfController(controller);
      expect(
        Memory.rooms[roomName].jobs.find((j: Job) => j.action === "upgrade")
      ).toBeUndefined();
    });
    it("should create no job because there is already an upgradeJob", () => {
      const controller = mockInstanceOf<StructureController>({
        room,
        id: "a",
        ticksToDowngrade: 15 * 1000,
        pos: new RoomPosition(2, 1, "roomName"),
      });

      const job = JobHandler.CreateJob.CreateUpgradeJob(controller, false);
      job.updateJobAtTick = 10000;
      StructureHelper.ControlUpgradingOfController(controller);
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
      expect(Memory.rooms[roomName].jobs[0].updateJobAtTick).toBe(10000);
    });
  });
  describe("ControlDamagedStructures", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
    });
    it("should add a repair job", () => {
      structure.hits = 0;
      StructureHelper.ControlDamagedStructures(structure);
      expect(Memory.rooms[roomName].jobs.length).toBe(1);
      expect(Memory.rooms[roomName].jobs[0].action).toBe("repair");
    });
    it("should do nothing", () => {
      structure.hits = structure.hitsMax;
      StructureHelper.ControlDamagedStructures(structure);
      expect(Memory.rooms[roomName].jobs.length).toBe(0);
    });
  });
});
