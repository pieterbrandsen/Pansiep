import Initialization from "../memory/initialization";
import GarbageCollection from "../memory/garbageCollection";
import Logger from "./logger";

interface IConsoleCommands {}

export default class ConsoleCommands implements IConsoleCommands {
  public static AssignCommandsToHeap(): boolean {
    if (global.help === undefined) global.help = this.HelpCommand;

    if (global.resetGlobalMemory === undefined)
      global.resetGlobalMemory = this.ResetGlobalMemoryCommand;
    if (global.resetRoomMemory === undefined)
      global.resetRoomMemory = this.ResetRoomMemoryCommand;
    if (global.resetStructureMemory === undefined)
      global.resetStructureMemory = this.ResetStructureMemoryCommand;
    if (global.resetCreepMemory === undefined)
      global.resetCreepMemory = this.ResetCreepMemoryCommand;

    if (global.deleteRoomMemory === undefined)
      global.deleteRoomMemory = this.DeleteRoomMemoryCommand;
    if (global.deleteStructureMemory === undefined)
      global.deleteStructureMemory = this.DeleteStructureMemoryCommand;
    if (global.deleteCreepMemory === undefined)
      global.deleteCreepMemory = this.DeleteCreepMemoryCommand;

    // if (global.showAllMyRooms === undefined) global.showAllMyRooms = this.ShowAllMyRooms;
    return true;
  }

  private static DescribeFunction(
    name: string,
    description: string,
    params?: { name: string; type: string }[]
  ): string {
    let string = "";
    string += `<br><br>Function   name: ${name}<br>Description: ${description}`;
    if (params && params.length > 0) {
      string += "<br>Params:";
      params.forEach((param) => {
        string += `<br>Name = ${param.name}, Type = ${param.type}`;
      });
    }
    string +=
      "<br>----------------------------------------------------------------";
    return string;
  }

  // public static ShowAllMyRooms(): string {
  //     const data = [];
  //     for (const roomName of Object.keys(Game.rooms)) {
  //         const room = Game.rooms[roomName];
  //         if (room) {
  //             const energy = room.storage ? room.storage.store.energy : 0;
  //             const level = room.controller ? '['+room.controller.level+']' : '';
  //             let color;
  //             if (energy >= 595000) {
  //                 color = '#00d55a';
  //             } else if (energy >= 575000) {
  //                 color = '#ffff33';
  //             } else if (energy >= 445000) {
  //                 color = '#ffb639';
  //             } else {
  //                 color = '#ff692f';
  //             }
  //             // const energyText = room.storage
  //             //     ? Utils.colored((energy+'').replace(/\d{3}$/, ' $&'), color) + ' ' + Utils.resourceIcon(RESOURCE_ENERGY)
  //             //     : '<div style="opacity: 0.5; padding-right: 5px">-- No storage --</div>';
  //             data.push([roomName, level]);
  //         }
  //     }
  //     const shardName = Game.shard.name;
  //     let result = '';
  //     result +=
  //     `<section class="profile" style="max-width: inherit">`+
  //         `<div class="rooms" style="background: inherit; box-shadow: none; margin: 0; padding: 0 10px 10px; white-space: normal">`;

  //     for (const [roomName, level] of _.sortBy(data, row => -row[0])) {
  //         result +=
  //         `<div style="display: inline-block">` +
  //             `<a class="room-preview" style="width: 100px; height: 125px" href="#!/room/${shardName}/${roomName}">` +
  //                 `<img style="width: 100px; height: 100px" src="https://d3os7yery2usni.cloudfront.net/map/${shardName}/${roomName}.png" alt ="Images only work on the official server">` +
  //                 `<div class="room-title" style="bottom: 0; height: 25px; line-height: 20px; padding: 3px 7px">${roomName} ${level}</div>` +
  //                 `</a>` +
  //                 // `<div style="padding-bottom: 10px; margin-top: -10px; padding-right: 10px; text-align: center">${energyText}</div>` +
  //         `</div>`;
  //     };

  //     result +=
  //         `</div>` +
  //     `</section>`;

  //   return result;
  // }

  public static ResetGlobalMemoryCommand(): string {
    Initialization.InitializeGlobalMemory();
    return "";
  }

  public static ResetRoomMemoryCommand(roomName: string): string {
    Initialization.InitializeRoomMemory(roomName);
    return "";
  }

  public static ResetStructureMemoryCommand(
    id: string,
    roomName: string
  ): string {
    Initialization.InitializeStructureMemory(id, roomName);
    return "";
  }

  public static ResetCreepMemoryCommand(
    creepName: string,
    roomName: string
  ): string {
    Initialization.InitializeCreepMemory(creepName, roomName);
    return "";
  }

  public static DeleteRoomMemoryCommand(roomName: string): string {
    GarbageCollection.RemoveRoom(roomName);
    return "";
  }

  public static DeleteStructureMemoryCommand(id: string): string {
    GarbageCollection.RemoveStructure(id);
    return "";
  }

  public static DeleteCreepMemoryCommand(creepName: string): string {
    GarbageCollection.RemoveCreep(creepName);
    return "";
  }

  public static HelpCommand(): string {
    let helpMessage: string = "<span style='color:Cornsilk'>";
    helpMessage += "All functions accessible using the Console";
    helpMessage += this.DescribeFunction(
      "functionName",
      "functionDescription",
      [{ name: "param1", type: "string" }]
    );
    helpMessage += this.DescribeFunction(
      "functionName2",
      "functionDescription2"
    );
    helpMessage += "<br><br>EndOfList";
    helpMessage += "</span";
    return helpMessage;
  }
}
