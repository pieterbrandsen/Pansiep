import { FunctionReturnCodes } from "../../utils/constants/global";
import { VisualDisplayLevels } from "../../utils/constants/room";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { AddRectWCoords, AddTextWCoords } from "../visuals";

export default class MainVisuals {
  /**
   * Draws all main visuals
   */
  public static Execute = FuncWrapper(function RoomMainVisuals(
    room: Room
  ): FunctionReturn {
    const displayLevel = VisualDisplayLevels.Info;

    const defaultXCoord = 1;
    const textXPos = defaultXCoord + 0.3;
    let topLeftPos = 5;
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
    AddRectWCoords(
      room,
      defaultXCoord,
      (topLeftPos += 1),
      8,
      20,
      displayLevel,
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
      displayLevel,
      titleTextStyle
    );
    AddTextWCoords(
      room,
      "> Main",
      textXPos,
      (topLeftPos += 1),
      displayLevel,
      subTitleTextStyle
    );
    AddTextWCoords(
      room,
      `GCL lvl: ${Game.gcl.level}`,
      textXPos,
      (topLeftPos += 1),
      displayLevel,
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
      displayLevel,
      textStyle
    );
    AddTextWCoords(
      room,
      `GPL lvl: ${Game.gpl.level}`,
      textXPos,
      (topLeftPos += 1),
      displayLevel,
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
      displayLevel,
      textStyle
    );
    AddTextWCoords(
      room,
      `Structure count: ${Object.keys(Memory.structures).length}`,
      textXPos,
      (topLeftPos += 1),
      displayLevel,
      textStyle
    );
    AddTextWCoords(
      room,
      `Creep count: ${Object.keys(Memory.creeps).length}`,
      textXPos,
      (topLeftPos += 1),
      displayLevel,
      textStyle
    );

    // Room
    topLeftPos += 3;
    AddTextWCoords(
      room,
      "Room:",
      textXPos,
      (topLeftPos += 1),
      displayLevel,
      titleTextStyle
    );
    AddTextWCoords(
      room,
      "> Main",
      textXPos,
      (topLeftPos += 1),
      displayLevel,
      subTitleTextStyle
    );
    if (room.controller) {
      AddTextWCoords(
        room,
        `RCL lvl: ${room.controller.level}`,
        textXPos,
        (topLeftPos += 1),
        displayLevel,
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
        displayLevel,
        textStyle
      );
    } else {
      AddTextWCoords(
        room,
        `RCL: No controller`,
        textXPos,
        (topLeftPos += 2),
        displayLevel,
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
      displayLevel,
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
      displayLevel,
      textStyle
    );
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  });
}
