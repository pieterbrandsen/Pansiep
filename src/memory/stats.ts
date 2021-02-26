import { union } from "lodash";
import {
  AverageValueOverAmountTicks,
  FunctionReturnCodes,
  StatsDigitCount,
} from "../utils/constants/global";
import { GetUpdateStatsVar } from "../utils/config/global";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const ResetPreProcessingStats = FuncWrapper(
  function ResetPreProcessingStats(): FunctionReturn {
    global.preProcessingStats = {
      intentCalls: {},
      funcCalls: {},
      rooms: {},
      ticksStatsCollecting: 0,
    };
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const ResetStats = FuncWrapper(function ResetStats(): FunctionReturn {
  Memory.stats = {
    intentCalls: {},
    funcCalls: {},
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
  current = 0,
  num = 0
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
    if (!GetUpdateStatsVar())
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
  if (!GetUpdateStatsVar())
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
    creepCount: creepCount.response,
    structureCount: structureCount.response,
  };

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const StructureStatsPreProcessing = FuncWrapper(
  function StructureStatsPreProcessing(structure: Structure): FunctionReturn {
    if (!GetUpdateStatsVar())
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
    if (!GetUpdateStatsVar())
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
    if (!GetUpdateStatsVar())
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    ResetPreProcessingStats();

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GlobalStats = FuncWrapper(function GlobalStats(): FunctionReturn {
  if (!GetUpdateStatsVar())
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  Memory.stats.ticksStatsCollecting += 1;

  const averagedIntentCallsList: StringMap<{
    callCount: number;
    cpuUsed: number;
  }> = {};

  union(
    Object.keys(Memory.stats.intentCalls),
    Object.keys(global.preProcessingStats.intentCalls)
  ).forEach((name: string) => {
    const currentCallCount =
      Memory.stats.intentCalls[name] !== undefined
        ? Memory.stats.intentCalls[name].callCount
        : 0;
    const newCallCount =
      global.preProcessingStats.intentCalls[name] !== undefined
        ? global.preProcessingStats.intentCalls[name].callCount
        : 0;
    const currentCpuUsed =
      Memory.stats.intentCalls[name] !== undefined
        ? Memory.stats.intentCalls[name].cpuUsed
        : 0;
    const newCpuUsed =
      global.preProcessingStats.intentCalls[name] !== undefined
        ? global.preProcessingStats.intentCalls[name].cpuUsed
        : 0;

    const callCount = GetAveragedValue(currentCallCount, newCallCount);
    const cpuUsed = GetAveragedValue(currentCpuUsed, newCpuUsed);
    averagedIntentCallsList[name] = {
      callCount: callCount.response,
      cpuUsed: cpuUsed.response,
    };
  });

  Memory.stats.intentCalls = averagedIntentCallsList;

  const averagedFuncCallsList: StringMap<{
    callCount: number;
    cpuUsed: number;
  }> = {};

  union(
    Object.keys(Memory.stats.funcCalls),
    Object.keys(global.preProcessingStats.funcCalls)
  ).forEach((name: string) => {
    const currentCallCount =
      Memory.stats.funcCalls[name] !== undefined
        ? Memory.stats.funcCalls[name].callCount
        : 0;
    const newCallCount =
      global.preProcessingStats.funcCalls[name] !== undefined
        ? global.preProcessingStats.funcCalls[name].callCount
        : 0;
    const currentCpuUsed =
      Memory.stats.funcCalls[name] !== undefined
        ? Memory.stats.funcCalls[name].cpuUsed
        : 0;
    const newCpuUsed =
      global.preProcessingStats.funcCalls[name] !== undefined
        ? global.preProcessingStats.funcCalls[name].cpuUsed
        : 0;

    const callCount = GetAveragedValue(currentCallCount, newCallCount);
    const cpuUsed = GetAveragedValue(currentCpuUsed, newCpuUsed);
    averagedFuncCallsList[name] = {
      callCount: callCount.response,
      cpuUsed: cpuUsed.response,
    };
  });
  Memory.stats.funcCalls = averagedFuncCallsList;

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});