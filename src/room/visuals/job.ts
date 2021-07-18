import { forEach } from "lodash";
import { VisualDisplayLevels } from "../../utils/constants/room";
import { FuncWrapper } from "../../utils/wrapper";
import { AddLineWCoords, AddRectWCoords, AddTextWCoords } from "../visuals";

export default class JobVisuals {
  /**
   * Draws all job visuals
   */
  public static Execute = FuncWrapper(function RoomJobVisuals(
    room: Room,
    roomStats: RoomStats
  ) {
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
    const visualDisplayLevel = VisualDisplayLevels.Debug;
    AddLineWCoords(
      room,
      defaultX,
      topLeftPos + 1,
      defaultX,
      topLeftPos + 21,
      visualDisplayLevel,
      { opacity: 1 }
    );
    AddRectWCoords(
      room,
      defaultX,
      (topLeftPos += 1),
      18,
      20,
      visualDisplayLevel,
      {
        opacity: 0.65,
        fill: "Grey",
      }
    );

    // Empire
    topLeftPos += 1;
    AddTextWCoords(
      room,
      "> Job",
      textXPos,
      (topLeftPos += 1),
      visualDisplayLevel,
      subTitleTextStyle
    );
    AddTextWCoords(
      room,
      `Active Job Types:`,
      textXPos,
      (topLeftPos += 1),
      visualDisplayLevel,
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
        if (jobList.creepCountPerJob[key])
          jobList.creepCountPerJob[key] += value;
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
        visualDisplayLevel,
        textStyle
      );
    });
    if (globalActiveJobs.length < 5) topLeftPos += 5 - globalActiveJobs.length;

    AddTextWCoords(
      room,
      `Creep Count Per Job Type:`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      visualDisplayLevel,
      textStyle
    );
    forEach(globalCreepCountPerJob, ([key, value]) => {
      AddTextWCoords(
        room,
        `${key}: ${value.toFixed(3)}`,
        textSecondRowXPos,
        (topLeftSecondRowPos += 1),
        visualDisplayLevel,
        textStyle
      );
    });
    if (globalCreepCountPerJob.length < 5)
      topLeftSecondRowPos += 5 - globalCreepCountPerJob.length;

    // Room
    topLeftPos += 4;
    AddTextWCoords(
      room,
      "> Job",
      textXPos,
      (topLeftPos += 1),
      visualDisplayLevel,
      subTitleTextStyle
    );
    AddTextWCoords(
      room,
      `Active Job Types:`,
      textXPos,
      (topLeftPos += 1),
      visualDisplayLevel,
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
        visualDisplayLevel,
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
      visualDisplayLevel,
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
        visualDisplayLevel,
        textStyle
      );
    });
    if (creepCountPerJob.length < 5)
      topLeftSecondRowPos += 5 - creepCountPerJob.length;
  });
}
