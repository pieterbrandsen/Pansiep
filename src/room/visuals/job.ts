import { forEach } from "lodash";
import RoomConstants from "../../utils/constants/room";
import WrapperHandler from "../../utils/wrapper";

import {
  AddLineWCoords,
  AddRectWCoords,
  AddTextWCoords,
  ShouldVisualsBeDisplayed,
} from "./draw";

/**
 * Draws all job visuals
 */
export default WrapperHandler.FuncWrapper(function RoomJobVisuals(
  room: Room,
  roomStats: RoomStats
) {
  const visualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;
  if (ShouldVisualsBeDisplayed(visualDisplayLevel) === false) return;
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
  AddLineWCoords(
    room,
    defaultX,
    topLeftPos + 1,
    defaultX,
    topLeftPos + 21,

    { opacity: 1 }
  );
  AddRectWCoords(
    room,
    defaultX,
    (topLeftPos += 1),
    18,
    20,

    {
      opacity: 0.65,
      fill: "Grey",
    }
  );

  // Empire
  topLeftPos += 1;
  AddTextWCoords(room, "> Job", textXPos, (topLeftPos += 1), subTitleTextStyle);
  AddTextWCoords(
    room,
    `Active Job Types:`,
    textXPos,
    (topLeftPos += 1),
    textStyle
  );
  const jobList: {
    activeJobs: StringMap<number>;
    creepCountPerJob: StringMap<number>;
  } = { activeJobs: {}, creepCountPerJob: {} };
  forEach(Object.values(Memory.stats.rooms), (rs: RoomStats) => {
    forEach(Object.entries(rs.activeJobs), ([key, value]) => {
      if (jobList.activeJobs[key]) jobList.activeJobs[key] += value;
      else jobList.activeJobs[key] = value;
    });
    forEach(Object.entries(rs.creepCountPerJob), ([key, value]) => {
      if (jobList.creepCountPerJob[key]) jobList.creepCountPerJob[key] += value;
      else jobList.creepCountPerJob[key] = value;
    });
  });
  const globalActiveJobs = Object.entries(jobList.activeJobs)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  const globalCreepCountPerJob = Object.entries(jobList.creepCountPerJob)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);

  forEach(globalActiveJobs, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  if (globalActiveJobs.length < 5) topLeftPos += 5 - globalActiveJobs.length;

  AddTextWCoords(
    room,
    `Creep Count Per Job Type:`,
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    textStyle
  );
  forEach(globalCreepCountPerJob, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      textStyle
    );
  });
  if (globalCreepCountPerJob.length < 5)
    topLeftSecondRowPos += 5 - globalCreepCountPerJob.length;

  // Room
  topLeftPos += 4;
  AddTextWCoords(room, "> Job", textXPos, (topLeftPos += 1), subTitleTextStyle);
  AddTextWCoords(
    room,
    `Active Job Types:`,
    textXPos,
    (topLeftPos += 1),
    textStyle
  );
  const activeJobs = Object.entries(roomStats.activeJobs)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  forEach(activeJobs, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  if (activeJobs.length < 5) topLeftPos += 5 - activeJobs.length;

  topLeftSecondRowPos += 5;
  AddTextWCoords(
    room,
    `Creep Count Per Job Type:`,
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    textStyle
  );
  const creepCountPerJob = Object.entries(roomStats.creepCountPerJob)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  forEach(creepCountPerJob, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      textStyle
    );
  });
  if (creepCountPerJob.length < 5)
    topLeftSecondRowPos += 5 - creepCountPerJob.length;
});
