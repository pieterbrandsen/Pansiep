import { VisualLevel } from "../utils/config/room";
import Logger from "../utils/logger";

export default class RoomVisuals {
  public static ShouldVisualsBeDisplayed(visualLevel: number): boolean {
    if (visualLevel <= VisualLevel) return true;
    return false;
  }

  public static AddLineWPos(
    room: Room,
    pos1: RoomPosition,
    pos2: RoomPosition,
    visualLevel: number,
    style?: LineStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.line(pos1, pos2, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddLineWPos", error, {
        room,
        pos1,
        pos2,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddLineWCoords(
    room: Room,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    visualLevel: number,
    style?: LineStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.line(x1, x2, y1, y2, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddLineWCoords", error, {
        room,
        x1,
        x2,
        y1,
        y2,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddCircleWPos(
    room: Room,
    pos: RoomPosition,
    visualLevel: number,
    style?: CircleStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.circle(pos, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddCircleWPos", error, {
        room,
        pos,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddCircleWCoords(
    room: Room,
    x: number,
    y: number,
    visualLevel: number,
    style?: CircleStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.circle(x, y, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddCircleWCoords", error, {
        room,
        x,
        y,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddRectWPos(
    room: Room,
    topLeftPos: RoomPosition,
    width: number,
    height: number,
    visualLevel: number,
    style?: PolyStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.rect(topLeftPos, width, height, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddRectWPos", error, {
        room,
        topLeftPos,
        width,
        height,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddRectWCoords(
    room: Room,
    x: number,
    y: number,
    width: number,
    height: number,
    visualLevel: number,
    style?: PolyStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.rect(x, y, width, height, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddRectWCoords", error, {
        room,
        x,
        y,
        width,
        height,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddPolyWPos(
    room: Room,
    topLeftPos: RoomPosition,
    width: number,
    height: number,
    visualLevel: number,
    style?: PolyStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.rect(topLeftPos, width, height, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddPolyWPos", error, {
        room,
        topLeftPos,
        width,
        height,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddPolyWCoords(
    room: Room,
    x: number,
    y: number,
    width: number,
    height: number,
    visualLevel: number,
    style?: PolyStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.rect(x, y, width, height, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddPolyWCoords", error, {
        room,
        x,
        y,
        width,
        height,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddTextWPos(
    room: Room,
    text: string,
    pos: RoomPosition,
    visualLevel: number,
    style?: TextStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.text(text, pos, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddTextWPos", error, {
        room,
        pos,
        visualLevel,
        style,
      });
      return false;
    }
  }

  public static AddTextWCoords(
    room: Room,
    text: string,
    x: number,
    y: number,
    visualLevel: number,
    style?: TextStyle
  ): boolean {
    try {
      if (!this.ShouldVisualsBeDisplayed(visualLevel)) return true;

      room.visual.text(text, x, y, style);
      return true;
    } catch (error) {
      Logger.Error("src/room/visuals:AddTextWCoords", error, {
        room,
        x,
        y,
        visualLevel,
        style,
      });
      return false;
    }
  }
}
