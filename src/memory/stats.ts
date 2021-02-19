import _ from "lodash";
import { AverageValueOverAmountTicks } from "../utils/constants/global";
import { SaveStats } from "../utils/config/global";
import Logger from "../utils/logger";

export default class Stats {
  public static ResetPreStats(): void {
    global.preProcessingStats = {
      calls: {},
      rooms: {},
      ticksStatsCollecting: 0,
    };
  }

  public static ResetStats(): void {
    Memory.stats = {
      calls: {},
      rooms: {},
      ticksStatsCollecting: 0,
    };
  }

  public static ResetPreRoomStats(roomName: string): void {
    global.preProcessingStats.rooms[roomName] = {
      creepCount: 0,
      structureCount: 0,
    };
  }

  public static ResetRoomStats(roomName: string): void {
    this.ResetPreRoomStats(roomName);
    Memory.stats.rooms[roomName] = {
      creepCount: 0,
      structureCount: 0,
    };
  }

  public static GetAveragedValue(current: number, num: number): number {
    const currentPercentage = (1 / AverageValueOverAmountTicks) * -1 + 1;
    const numPercentage = 1 / AverageValueOverAmountTicks;

    const notRounded: number =
      current * currentPercentage + num * numPercentage;
    return parseFloat(notRounded.toFixed(5));
  }

  public static RoomStatsPreProcessing(room: Room): boolean {
    if (!SaveStats) return true;

    this.ResetPreRoomStats(room.name);

    return true;
  }

  public static RoomStatsProcessing(room: Room): boolean {
    const preRoomStats = global.preProcessingStats.rooms[room.name];
    let roomStats = Memory.stats.rooms[room.name];
    if (roomStats === undefined) {
      this.ResetRoomStats(room.name);
      roomStats = Memory.stats.rooms[room.name];
    }

    Memory.stats.rooms[room.name] = {
      creepCount: this.GetAveragedValue(
        roomStats.creepCount,
        preRoomStats.creepCount
      ),
      structureCount: this.GetAveragedValue(
        roomStats.structureCount,
        preRoomStats.structureCount
      ),
    };
    return true;
  }

  public static StructureStatsPreProcessing(structure: Structure): boolean {
    if (!SaveStats) return true;

    const roomStats = global.preProcessingStats.rooms[structure.room.name];
    roomStats.structureCount += 1;
    return true;
  }

  public static CreepStatsPreProcessing(creep: Creep): boolean {
    if (!SaveStats) return true;

    const roomStats = global.preProcessingStats.rooms[creep.room.name];
    roomStats.creepCount += 1;
    return true;
  }

  public static GlobalStatsPreProcessing(): boolean {
    try {
      if (!SaveStats) return true;

      this.ResetPreStats();
      return true;
    } catch (error) {
      Logger.Error("memory/stats:GlobalStatsPreProcessing", error);
      return false;
    }
  }

  public static GlobalStatsProcessing(): boolean {
    if (!SaveStats) return true;

    Memory.stats.ticksStatsCollecting += 1;
    const averagedCallsList: StringMap<{
      callCount: number;
      cpuUsed: number;
    }> = {};

    _.union(
      Object.keys(Memory.stats.calls),
      Object.keys(global.preProcessingStats.calls)
    ).forEach((name: string) => {
      const currentCallCount =
        Memory.stats.calls[name] !== undefined
          ? Memory.stats.calls[name].callCount
          : 0;
      const newCallCount =
        global.preProcessingStats.calls[name] !== undefined
          ? global.preProcessingStats.calls[name].callCount
          : 0;
      const currentCpuUsed =
        Memory.stats.calls[name] !== undefined
          ? Memory.stats.calls[name].cpuUsed
          : 0;
      const newCpuUsed =
        global.preProcessingStats.calls[name] !== undefined
          ? global.preProcessingStats.calls[name].cpuUsed
          : 0;
      averagedCallsList[name] = {
        callCount: this.GetAveragedValue(currentCallCount, newCallCount),
        cpuUsed: this.GetAveragedValue(currentCpuUsed, newCpuUsed),
      };
    });
    Memory.stats.calls = averagedCallsList;
    return true;
  }
}
