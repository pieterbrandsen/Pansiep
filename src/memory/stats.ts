import { groupBy, union } from "lodash";
import RoomHelper from "../room/helper";
import GlobalConfig from "../utils/config/global";
import GlobalConstants from "../utils/constants/global";
import WrapperHandler from "../utils/wrapper";

export default class StatsHandler {
  public static ResetPreProcessingStats = WrapperHandler.FuncWrapper(
    function ResetPreProcessingStats(): void {
      global.preProcessingStats = {
        intentCalls: {},
        funcCalls: {},
        rooms: {},
        ticksStatsCollecting: 0,
        gcl: Game.gcl,
        cpu: { bucket: {}, usage: {} },
      };
    }
  );

  public static ResetStats = WrapperHandler.FuncWrapper(
    function ResetStats(): void {
      Memory.stats = {
        intentCalls: {},
        funcCalls: {},
        rooms: {},
        ticksStatsCollecting: 0,
        gcl: { progress: 0, progressTotal: 0, level: 0 },
        cpu: { bucket: {}, usage: {} },
      };
    }
  );

  public static ResetPreProcessingRoomStats = WrapperHandler.FuncWrapper(
    function ResetPreProcessingRoomStats(id: string): void {
      global.preProcessingStats.rooms[id] = {
        creepCount: 0,
        structureCount: 0,
        rcl: { progress: 0, progressTotal: 0, level: 0 },
        energyExpenses: { build: 0, repair: 0, upgrade: 0, spawn: {} },
        energyIncome: { dismantle: 0, harvest: 0 },
        activeJobs: {},
        creepCountPerJob: {},
        energyInStorages: {
          containers: 0,
          storage: 0,
          terminal: 0,
        },
      };
    }
  );

  public static ResetRoomStats = WrapperHandler.FuncWrapper(
    function ResetRoomStats(id: string): void {
      Memory.stats.rooms[id] = {
        creepCount: 0,
        structureCount: 0,
        rcl: { progress: 0, progressTotal: 0, level: 0 },
        energyExpenses: { build: 0, repair: 0, upgrade: 0, spawn: {} },
        energyIncome: { dismantle: 0, harvest: 0 },
        activeJobs: {},
        creepCountPerJob: {},
        energyInStorages: {
          containers: 0,
          storage: 0,
          terminal: 0,
        },
      };
    }
  );

  public static GetAveragedValue = WrapperHandler.FuncWrapper(
    function GetAveragedValue(current: number, num: number): number {
      const currentPercentage =
        (1 / GlobalConstants.AverageValueOverAmountTicks) * -1 + 1;
      const numPercentage = 1 / GlobalConstants.AverageValueOverAmountTicks;
      const newValue = parseFloat(
        (current * currentPercentage + num * numPercentage).toFixed(
          GlobalConstants.StatsDigitCount
        )
      );

      return newValue;
    }
  );

  public static RoomStatsPreProcessing = WrapperHandler.FuncWrapper(
    function RoomStatsPreProcessing(roomName: string): void {
      StatsHandler.ResetPreProcessingRoomStats(roomName);
    }
  );

  public static RoomStats = WrapperHandler.FuncWrapper(function RoomStats(
    room: Room
  ): void {
    if (!GlobalConfig.UpdateStats) return;

    const preProcessingRoomStats = global.preProcessingStats.rooms[room.name];
    const roomMem: RoomMemory = RoomHelper.GetRoomMemory(room.name);
    const roomStats: RoomStats = RoomHelper.GetRoomStatsMemory(room.name);

    Memory.stats.rooms[room.name] = {
      creepCount: StatsHandler.GetAveragedValue(
        roomStats.creepCount,
        preProcessingRoomStats.creepCount
      ),
      structureCount: StatsHandler.GetAveragedValue(
        roomStats.structureCount,
        preProcessingRoomStats.structureCount
      ),
      rcl: room.controller
        ? {
            progress: room.controller.progress,
            progressTotal: room.controller.progressTotal,
            level: room.controller.level,
          }
        : { progress: 0, progressTotal: 0, level: 0 },
      energyExpenses: {
        build: StatsHandler.GetAveragedValue(
          roomStats.energyExpenses.build,
          preProcessingRoomStats.energyExpenses.build
        ),
        repair: StatsHandler.GetAveragedValue(
          roomStats.energyExpenses.repair,
          preProcessingRoomStats.energyExpenses.repair
        ),
        upgrade: StatsHandler.GetAveragedValue(
          roomStats.energyExpenses.upgrade,
          preProcessingRoomStats.energyExpenses.upgrade
        ),
        spawn: {},
      },
      energyIncome: {
        dismantle: StatsHandler.GetAveragedValue(
          roomStats.energyIncome.dismantle,
          preProcessingRoomStats.energyIncome.dismantle
        ),
        harvest: StatsHandler.GetAveragedValue(
          roomStats.energyIncome.harvest,
          preProcessingRoomStats.energyIncome.harvest
        ),
      },
      activeJobs: {},
      creepCountPerJob: {},
      energyInStorages: {
        containers: StatsHandler.GetAveragedValue(
          roomStats.energyInStorages.containers,
          preProcessingRoomStats.energyInStorages.containers
        ),
        storage: StatsHandler.GetAveragedValue(
          roomStats.energyInStorages.storage,
          preProcessingRoomStats.energyInStorages.storage
        ),
        terminal: StatsHandler.GetAveragedValue(
          roomStats.energyInStorages.terminal,
          preProcessingRoomStats.energyInStorages.terminal
        ),
      },
    };

    const activeJobsCount: StringMap<number> = {};
    const creepCountPerJobCount: StringMap<number> = {};
    const currentJobs = groupBy(roomMem.jobs, (j: Job) => j.action);
    union(Object.keys(roomStats.activeJobs), Object.keys(currentJobs)).forEach(
      (name: string) => {
        activeJobsCount[name] = StatsHandler.GetAveragedValue(
          roomStats.activeJobs[name] ? roomStats.activeJobs[name] : 0,
          currentJobs[name] ? currentJobs[name].length : 0
        );

        const roomCreepCount: number = currentJobs[name]
          ? currentJobs[name].reduce<number>((acc, job) => {
              // eslint-disable-next-line no-param-reassign
              acc += job.assignedCreepsNames.length;
              return acc;
            }, 0)
          : 0;
        creepCountPerJobCount[name] = StatsHandler.GetAveragedValue(
          roomStats.creepCountPerJob[name]
            ? roomStats.creepCountPerJob[name]
            : 0,
          roomCreepCount
        );
      }
    );
    Memory.stats.rooms[room.name].activeJobs = activeJobsCount;
    Memory.stats.rooms[room.name].creepCountPerJob = creepCountPerJobCount;

    const spawnCosts: StringMap<number> = {};
    union(
      Object.keys(roomStats.energyExpenses.spawn),
      Object.keys(preProcessingRoomStats.energyExpenses.spawn)
    ).forEach((name: string) => {
      const currentCallCount =
        roomStats.energyExpenses.spawn[name] !== undefined
          ? roomStats.energyExpenses.spawn[name]
          : 0;
      const newCallCount =
        preProcessingRoomStats.energyExpenses.spawn[name] !== undefined
          ? preProcessingRoomStats.energyExpenses.spawn[name]
          : 0;

      spawnCosts[name] = StatsHandler.GetAveragedValue(
        currentCallCount,
        newCallCount
      );
    });

    Memory.stats.rooms[room.name].energyExpenses.spawn = spawnCosts;
  });

  public static StructureStatsPreProcessing = WrapperHandler.FuncWrapper(
    function StructureStatsPreProcessing(structure: Structure): void {
      if (!GlobalConfig.UpdateStats) return;

      const preProcessingRoomStats =
        global.preProcessingStats.rooms[structure.room.name];
      preProcessingRoomStats.structureCount += 1;

      switch (structure.structureType) {
        case STRUCTURE_STORAGE:
          preProcessingRoomStats.energyInStorages.storage = (structure as StructureStorage).store.energy;
          break;
        case STRUCTURE_TERMINAL:
          preProcessingRoomStats.energyInStorages.terminal = (structure as StructureTerminal).store.energy;
          break;
        case STRUCTURE_CONTAINER:
          // if (roomStats.energyInStorages.containers > 0)
          // roomStats.energyInStorages.containers += (structure as StructureContainer).store.energy;
          // else
          preProcessingRoomStats.energyInStorages.containers += (structure as StructureContainer).store.energy;
          break;
        default:
          break;
      }
    }
  );

  public static CreepStatsPreProcessing = WrapperHandler.FuncWrapper(
    function CreepStatsPreProcessing(roomName: string): void {
      if (!GlobalConfig.UpdateStats) return;

      const roomStats = global.preProcessingStats.rooms[roomName];
      roomStats.creepCount += 1;
    }
  );

  public static GlobalStatsPreProcessing = WrapperHandler.FuncWrapper(
    function GlobalStatsPreProcessing(): void {
      if (!GlobalConfig.UpdateStats) return;

      StatsHandler.ResetPreProcessingStats();
    }
  );

  public static GlobalStats = WrapperHandler.FuncWrapper(
    function GlobalStats(): void {
      if (!GlobalConfig.UpdateStats) return;

      Memory.stats.ticksStatsCollecting += 1;
      Memory.stats.gcl = Game.gcl;

      const cpuStats = Memory.stats.cpu;
      cpuStats.bucket[Game.shard.name] = StatsHandler.GetAveragedValue(
        cpuStats.bucket[Game.shard.name],
        Game.cpu.bucket
      );
      cpuStats.usage[Game.shard.name] = StatsHandler.GetAveragedValue(
        cpuStats.usage[Game.shard.name],
        Game.cpu.getUsed()
      );

      const { preProcessingStats } = global;
      const averagedIntentCallsList: StringMap<{
        callCount: number;
        cpuUsed: number;
      }> = {};

      union(
        Object.keys(Memory.stats.intentCalls),
        Object.keys(preProcessingStats.intentCalls)
      ).forEach((name: string) => {
        averagedIntentCallsList[name] = {
          callCount: StatsHandler.GetAveragedValue(
            Memory.stats.intentCalls[name] !== undefined
              ? Memory.stats.intentCalls[name].callCount
              : 0,
            preProcessingStats.intentCalls[name] !== undefined
              ? preProcessingStats.intentCalls[name].callCount
              : 0
          ),
          cpuUsed: StatsHandler.GetAveragedValue(
            Memory.stats.intentCalls[name] !== undefined
              ? Memory.stats.intentCalls[name].cpuUsed
              : 0,
            preProcessingStats.intentCalls[name] !== undefined
              ? preProcessingStats.intentCalls[name].cpuUsed
              : 0
          ),
        };
      });

      Memory.stats.intentCalls = averagedIntentCallsList;

      const averagedFuncCallsList: StringMap<{
        callCount: number;
        cpuUsed: number;
      }> = {};

      union(
        Object.keys(Memory.stats.funcCalls),
        Object.keys(preProcessingStats.funcCalls)
      ).forEach((name: string) => {
        averagedFuncCallsList[name] = {
          callCount: StatsHandler.GetAveragedValue(
            Memory.stats.funcCalls[name] !== undefined
              ? Memory.stats.funcCalls[name].callCount
              : 0,
            preProcessingStats.funcCalls[name] !== undefined
              ? preProcessingStats.funcCalls[name].callCount
              : 0
          ),
          cpuUsed: StatsHandler.GetAveragedValue(
            Memory.stats.funcCalls[name] !== undefined
              ? Memory.stats.funcCalls[name].cpuUsed
              : 0,
            preProcessingStats.funcCalls[name] !== undefined
              ? preProcessingStats.funcCalls[name].cpuUsed
              : 0
          ),
        };
      });
      Memory.stats.funcCalls = averagedFuncCallsList;
    }
  );
}
