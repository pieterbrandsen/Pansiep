import { FunctionReturnCodes } from "../utils/constants/global";
import { VisualDisplayLevels } from "../utils/constants/room";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { AddLineWCoords, AddRectWCoords, AddTextWCoords } from "./visuals";
import { forEach, groupBy } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export const MainVisuals = FuncWrapper(function RoomMainVisuals(
  room: Room
): FunctionReturn {
  const defaultX = 1;
  const textXPos = defaultX + 0.3;
  const titleTextStyle: TextStyle = {
    align: "left",
    font: 1,
  };
  const subTitleTextStyle: TextStyle = {
    align: "left",
    font: 0.9,
  };
  const textStyle: TextStyle = {
    align: "left",
  };
  let topLeftPos = 5;
  AddRectWCoords(
    room,
    defaultX,
    (topLeftPos += 1),
    8,
    20,
    VisualDisplayLevels.Info,
    {
      opacity: 0.65,
      fill: "Grey",
    }
  );

  // Empire
  AddTextWCoords(
    room,
    "Empire:",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    titleTextStyle
  );
  AddTextWCoords(
    room,
    "> Main",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    subTitleTextStyle
  );
  AddTextWCoords(
    room,
    `GCL lvl: ${Game.gcl.level}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `GCL progress: ${(
      (Game.gcl.progress / Game.gcl.progressTotal) *
      100
    ).toFixed(2)}%`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `GPL lvl: ${Game.gpl.level}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `GPL progress: ${(
      (Game.gpl.progress / Game.gpl.progressTotal) *
      100
    ).toFixed(2)}%`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `Structure count: ${Object.keys(Memory.structures).length}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `Creep count: ${Object.keys(Memory.creeps).length}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );

  // Room
  topLeftPos += 3;
  AddTextWCoords(
    room,
    "Room:",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    titleTextStyle
  );
  AddTextWCoords(
    room,
    "> Main",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    subTitleTextStyle
  );
  if (room.controller) {
    AddTextWCoords(
      room,
      `RCL lvl: ${room.controller.level}`,
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      textStyle
    );
    AddTextWCoords(
      room,
      `RCL progress: ${(
        (room.controller.progress / room.controller.progressTotal) *
        100
      ).toFixed(2)}%`,
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      textStyle
    );
  } else {
    AddTextWCoords(
      room,
      `RCL: No controller`,
      textXPos,
      (topLeftPos += 2),
      VisualDisplayLevels.Info,
      textStyle
    );
  }
  AddTextWCoords(
    room,
    `Structure count: ${
      Memory.cache.structures.data[room.name]
        ? Memory.cache.structures.data[room.name].length
        : 0
    }`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `Creep count: ${
      Memory.cache.creeps.data[room.name]
        ? Memory.cache.creeps.data[room.name].length
        : 0
    }`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const IncomeAndExpensesVisuals = FuncWrapper(function IncomeAndExpensesVisuals(room:Room, roomStats:RoomStats) {
  const defaultX = 9;
  const textXPos = defaultX + 0.3;

  const secondRowX = defaultX + 8;
  const textSecondRowXPos = secondRowX + 0.3;
  const subTitleTextStyle: TextStyle = {
    align: "left",
    font: 0.9,
  };
  const textStyle: TextStyle = {
    align: "left",
  };
  let topLeftPos = 5;
  let topLeftSecondRowPos = 5;
  AddLineWCoords(room, defaultX, topLeftPos+1,defaultX,topLeftPos+21, VisualDisplayLevels.Info, {opacity:1})
  AddRectWCoords(
    room,
    defaultX,
    (topLeftPos += 1),
    18,
  20,
    VisualDisplayLevels.Info,
    {
      opacity: 0.65,
      fill: "Grey",
    }
  );

    // Empire
    topLeftPos += 1
    AddTextWCoords(
      room,
      "> Net Profit",
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      subTitleTextStyle
      );

      AddTextWCoords(
        room,
        "Income:",
        textXPos,
        (topLeftPos += 1),
        VisualDisplayLevels.Info,
        textStyle
        );

    topLeftPos += 9;
    AddTextWCoords(
      room,
      "> Net Profit",
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      subTitleTextStyle
      );
    AddTextWCoords(
      room,
      "Income:",
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      textStyle
      );

      topLeftSecondRowPos += 3;
    AddTextWCoords(
    room,
    "Expense:",
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );

  topLeftSecondRowPos += 10;
  AddTextWCoords(
  room,
  "Expense:",
  textSecondRowXPos,
  (topLeftSecondRowPos += 1),
  VisualDisplayLevels.Info,
  textStyle
);
});

export const JobVisuals = FuncWrapper(function JobVisuals(room:Room, roomStats:RoomStats) {
  const defaultX = 27;
  const textXPos = defaultX + 0.3;

  const secondRowX = defaultX + 8;
  const textSecondRowXPos = secondRowX + 0.3;
  const subTitleTextStyle: TextStyle = {
    align: "left",
    font: 0.9,
  };
  const textStyle: TextStyle = {
    align: "left",
  };
  let topLeftPos = 5;
  let topLeftSecondRowPos = 8;
  AddLineWCoords(room, defaultX, topLeftPos+1,defaultX,topLeftPos+21, VisualDisplayLevels.Debug, {opacity:1})
  AddRectWCoords(
    room,
    defaultX,
    (topLeftPos += 1),
    18,
  20,
    VisualDisplayLevels.Debug,
    {
      opacity: 0.65,
      fill: "Grey",
    }
  );

  // Empire
  topLeftPos += 1
  AddTextWCoords(
    room,
    "> Job",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Debug,
    subTitleTextStyle
  );
  AddTextWCoords(
    room,
    `Active Job Types:`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Debug,
    textStyle
  );
  const jobList: {activeJobs:StringMap<number>,creepCountPerJob:StringMap<number>} = {activeJobs:{},creepCountPerJob:{}};
  forEach(Object.values(Memory.stats.rooms),(rs:RoomStats)=>{
    forEach(Object.entries(rs.activeJobs), ([key,value])=> {
      jobList.activeJobs[key] ?   jobList.activeJobs[key]+=value :   jobList.activeJobs[key] = value;
    });
    forEach(Object.entries(rs.creepCountPerJob), ([key,value])=> {
      jobList.creepCountPerJob[key] ?   jobList.creepCountPerJob[key]+=value :   jobList.creepCountPerJob[key] = value;
    });
  });
  const globalActiveJobs =Object.entries(jobList.activeJobs).slice(0,5).sort((a,b) => b[1]-a[1]);
const globalCreepCountPerJob = Object.entries(jobList.creepCountPerJob).slice(0,5).sort((a,b) => b[1]-a[1]);

  forEach(globalActiveJobs,([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Debug,
      textStyle
    );
  });
  if (globalActiveJobs.length < 5) topLeftPos += 5-globalActiveJobs.length;

  AddTextWCoords(
    room,
    `Creep Count Per Job Type:`,
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    VisualDisplayLevels.Debug,
    textStyle
  );
  forEach(globalCreepCountPerJob,([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      VisualDisplayLevels.Debug,
      textStyle
    );
  });
  if (globalCreepCountPerJob.length < 5) topLeftSecondRowPos += 5-globalCreepCountPerJob.length;

  // Room
  topLeftPos += 4;
  AddTextWCoords(
    room,
    "> Job",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Debug,
    subTitleTextStyle
  );
  AddTextWCoords(
    room,
    `Active Job Types:`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Debug,
    textStyle
  );
  const activeJobs = Object.entries(roomStats.activeJobs).slice(0,5).sort((a,b) => b[1]-a[1]);
  forEach(activeJobs,([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Debug,
      textStyle
    );
  });
  if (activeJobs.length < 5) topLeftPos += 5-activeJobs.length;

  topLeftSecondRowPos += 5;
  AddTextWCoords(
    room,
    `Creep Count Per Job Type:`,
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    VisualDisplayLevels.Debug,
    textStyle
  );
  const creepCountPerJob = Object.entries(roomStats.creepCountPerJob).slice(0,5).sort((a,b) => b[1]-a[1]);
  forEach(creepCountPerJob,([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      VisualDisplayLevels.Debug,
      textStyle
    );
  });
  if (creepCountPerJob.length < 5) topLeftSecondRowPos += 5-creepCountPerJob.length;
});

export const RoomVisuals = FuncWrapper(function RoomVisuals(room:Room) {
  MainVisuals(room);


  const roomStats:RoomStats = Memory.stats.rooms[room.name];
  IncomeAndExpensesVisuals(room,roomStats);
  JobVisuals(room,roomStats);
});