import _ from "lodash";
import {
  AverageValueOverAmountTicks,
  FunctionReturnCodes,
  StatsDigitCount,
} from "../utils/constants/global";
import { SaveStats } from "../utils/config/global";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const ResetPreProcessingStats = FuncWrapper(
  function ResetPreProcessingStats(): FunctionReturn {
    global.preProcessingStats = {
      calls: {},
      rooms: {},
      ticksStatsCollecting: 0,
    };
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const ResetStats = FuncWrapper(function ResetStats(): FunctionReturn {
  Memory.stats = {
    calls: {},
    rooms: {},
    ticksStatsCollecting: 0,
  };

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ResetPreProcessingRoomStats = FuncWrapper(
  function ResetPreProcessingRoomStats(id: string): FunctionReturn {
    global.preProcessingStats.rooms[id] = {
      creepCount: 0,
      structureCount: 0,
    };

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const ResetRoomStats = FuncWrapper(function ResetRoomStats(
  id: string
): FunctionReturn {
  Memory.stats.rooms[id] = {
    creepCount: 0,
    structureCount: 0,
  };

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetAveragedValue = FuncWrapper(function GetAveragedValue(
  current: number,
  num: number
): FunctionReturn {
  const currentPercentage = (1 / AverageValueOverAmountTicks) * -1 + 1;
  const numPercentage = 1 / AverageValueOverAmountTicks;
  const newValue = parseFloat(
    (current * currentPercentage + num * numPercentage).toFixed(StatsDigitCount)
  );

  return FunctionReturnHelper<number>(FunctionReturnCodes.OK, newValue);
});

export const RoomStatsPreProcessing = FuncWrapper(
  function RoomStatsPreProcessing(room: Room): FunctionReturn {
    if (!SaveStats)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    ResetPreProcessingRoomStats(room.name);

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const RoomStats = FuncWrapper(function RoomStats(
  room: Room
): FunctionReturn {
  if (!SaveStats)
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  let preProcessingRoomStats = global.preProcessingStats.rooms[room.name];
  let roomStats = Memory.stats.rooms[room.name];

  if (preProcessingRoomStats === undefined) {
    ResetPreProcessingRoomStats(room.name);
    preProcessingRoomStats = global.preProcessingStats.rooms[room.name];
  }

  if (roomStats === undefined) {
    ResetRoomStats(room.name);
    roomStats = Memory.stats.rooms[room.name];
  }

  const creepCount = GetAveragedValue(
    roomStats.creepCount,
    preProcessingRoomStats.creepCount
  );
  const structureCount = GetAveragedValue(
    roomStats.structureCount,
    preProcessingRoomStats.structureCount
  );
  Memory.stats.rooms[room.name] = {
    creepCount:
      creepCount.code === FunctionReturnCodes.OK ? creepCount.response : 0,
    structureCount:
      structureCount.code === FunctionReturnCodes.OK
        ? structureCount.response
        : 0,
  };

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const StructureStatsPreProcessing = FuncWrapper(
  function StructureStatsPreProcessing(structure: Structure): FunctionReturn {
    if (!SaveStats)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    const roomStats = global.preProcessingStats.rooms[structure.room.name];
    roomStats.structureCount += 1;

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const CreepStatsPreProcessing = FuncWrapper(
  function CreepStatsPreProcessing(creep: Creep): FunctionReturn {
    if (!SaveStats)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    const roomStats = global.preProcessingStats.rooms[creep.room.name];
    roomStats.creepCount += 1;

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GlobalStatsPreProcessing = FuncWrapper(
  function GlobalStatsPreProcessing(): FunctionReturn {
    if (!SaveStats)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    ResetPreProcessingStats();

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GlobalStats = FuncWrapper(function GlobalStats(): FunctionReturn {
  if (!SaveStats)
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

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

    const callCount = GetAveragedValue(currentCallCount, newCallCount);
    const cpuUsed = GetAveragedValue(currentCpuUsed, newCpuUsed);
    averagedCallsList[name] = {
      callCount:
        callCount.code === FunctionReturnCodes.OK ? callCount.response : 0,
      cpuUsed: cpuUsed.code === FunctionReturnCodes.OK ? cpuUsed.response : 0,
    };
  });
  Memory.stats.calls = averagedCallsList;

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
