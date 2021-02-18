import {VisualLevel} from "../utils/config/room";
import {VisualDisplayLevels} from "../utils/constants/room";
import Logger from "../utils/logger";


export default class RoomVisuals {
  public static ShouldVisualsBeDisplayed(visualLevel: number): boolean {
    if (visualLevel >= VisualLevel) return true;
    return false;
  }

  public static AddLineWPos(room: Room, pos1: RoomPosition, pos2: RoomPosition, visualLevel: number, style?: LineStyle): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.line(pos1,pos2,style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddLineWPos", error, {room, pos1, pos2, visualLevel, style});
      return false;
    }
  }

  // public static AddLineWCoords(room: Room, x1: number, x2: number, y1: number, y2: number, visualLevel: number, style?: LineStyle): boolean {
  //   try {
  //     if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;
  //   } catch (error) {
      
  //   }
  //   return true;
  // }
}