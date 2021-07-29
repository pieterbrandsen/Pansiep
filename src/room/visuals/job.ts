import { forEach } from "lodash";
import RoomConstants from "../../utils/constants/room";
import WrapperHandler from "../../utils/wrapper";
import DrawVisualHandler from "./drawVisual";

/**
 * Draws all job visuals
 */
export default WrapperHandler.FuncWrapper(function RoomJobVisuals(
  room: Room,
  roomStats: RoomStats
) {
  if (
    DrawVisualHandler.ShouldVisualsBeDisplayed(
      RoomConstants.VisualDisplayLevels.Debug
    ) === false
  )
    return;
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
  DrawVisualHandler.AddLineWCoords(
    room,
    defaultX,
    topLeftPos + 1,
    defaultX,
    topLeftPos + 21,

    { opacity: 1 }
  );
  DrawVisualHandler.AddRectWCoords(
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
  DrawVisualHandler.AddTextWCoords(
    room,
    "> Job",
    textXPos,
    (topLeftPos += 1),
    subTitleTextStyle
  );
  DrawVisualHandler.AddTextWCoords(
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
  forEach(Object.values(Memory.stats.rooms), (memRoomStats: RoomStats) => {
    forEach(Object.entries(memRoomStats.activeJobs), ([jobName, count]) => {
      // if (jobList.activeJobs[jobName]) jobList.activeJobs[jobName] += count;
      // else jobList.activeJobs[jobName] = count;
      jobList.activeJobs[jobName] = count;
    });
    forEach(
      Object.entries(memRoomStats.creepCountPerJob),
      ([jobName, creepCount]) => {
        // if (jobList.creepCountPerJob[jobName]) jobList.creepCountPerJob[jobName] += creepCount;
        // else jobList.creepCountPerJob[jobName] = creepCount;
        jobList.creepCountPerJob[jobName] = creepCount;
      }
    );
  });
  const globalActiveJobs = Object.entries(jobList.activeJobs)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  const globalCreepCountPerJob = Object.entries(jobList.creepCountPerJob)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);

  forEach(globalActiveJobs, ([jobName, count]) => {
    DrawVisualHandler.AddTextWCoords(
      room,
      `${jobName}: ${count.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  if (globalActiveJobs.length < 5) topLeftPos += 5 - globalActiveJobs.length;

  DrawVisualHandler.AddTextWCoords(
    room,
    `Creep Count Per Job Type:`,
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    textStyle
  );
  forEach(globalCreepCountPerJob, ([key, value]) => {
    DrawVisualHandler.AddTextWCoords(
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
  DrawVisualHandler.AddTextWCoords(
    room,
    "> Job",
    textXPos,
    (topLeftPos += 1),
    subTitleTextStyle
  );
  DrawVisualHandler.AddTextWCoords(
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
    DrawVisualHandler.AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  if (activeJobs.length < 5) topLeftPos += 5 - activeJobs.length;

  topLeftSecondRowPos += 5;
  DrawVisualHandler.AddTextWCoords(
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
    DrawVisualHandler.AddTextWCoords(
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
