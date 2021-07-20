import { forEach } from "lodash";
import FuncWrapper from "./wrapper";
import MemoryInitializationHandler from "../memory/initialization";
import GarbageCollectionHandler from "../memory/garbageCollection";

type Param = { name: string; type: string };

export default class ConsoleCommandsHandler {
  /**
   * Return an html string that describes an function based on params.
   */
  private static DescribeFunction = FuncWrapper(function DescribeFunction(
    name: string,
    description: string,
    params?: Param[]
  ): string {
    let message = `<br><br>Function name: ${name}<br>Description: ${description}`;
    if (params && params.length > 0) {
      message += "<br>Params:";
      forEach(params, (param: Param) => {
        message += `<br>Name = ${param.name}, Type = ${param.type}`;
      });
    }
    message +=
      "<br>----------------------------------------------------------------";
    return message;
  });

  // #region Commands
  private static ResetGlobalMemoryCommand = FuncWrapper(
    function ResetGlobalMemoryCommand(): boolean {
      return MemoryInitializationHandler.InitializeGlobalMemory();
    }
  );

  private static ResetRoomMemoryCommand = FuncWrapper(
    function ResetRoomMemoryCommand(id: string): boolean {
      return MemoryInitializationHandler.InitializeRoomMemory(id);
    }
  );

  private static ResetStructureMemoryCommand = FuncWrapper(
    function ResetStructureMemoryCommand(
      id: string,
      roomName: string
    ): boolean {
      return MemoryInitializationHandler.InitializeStructureMemory(
        id,
        roomName
      );
    }
  );

  private static ResetCreepMemoryCommand = FuncWrapper(
    function ResetCreepMemoryCommand(id: string, roomName: string): boolean {
      return MemoryInitializationHandler.InitializeCreepMemory(id, roomName);
    }
  );

  private static DeleteRoomMemoryCommand = FuncWrapper(
    function DeleteRoomMemoryCommand(id: string): boolean {
      return GarbageCollectionHandler.RemoveRoom(id);
    }
  );

  private static DeleteStructureMemoryCommand = FuncWrapper(
    function DeleteStructureMemoryCommand(
      id: Id<Structure>,
      roomName: string
    ): boolean {
      return GarbageCollectionHandler.RemoveStructure(id, roomName);
    }
  );

  private static DeleteCreepMemoryCommand = FuncWrapper(
    function DeleteCreepMemoryCommand(id: string, roomName: string): boolean {
      return GarbageCollectionHandler.RemoveCreep(id, roomName);
    }
  );

  private static HelpCommand = FuncWrapper(function HelpCommand(): string {
    let helpMessage = "<span style='color:Cornsilk'>";
    helpMessage += "All functions accessible using the Console";
    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "ResetGlobalMemoryCommand",
      "Reset all memory"
    );
    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "ResetRoomMemoryCommand",
      "Reset the memory of an room",
      [{ name: "id", type: "string" }]
    );
    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "ResetStructureMemoryCommand",
      "Reset the memory of an structure",
      [
        { name: "id", type: "string" },
        { name: "roomName", type: "string" },
      ]
    );
    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "ResetCreepMemoryCommand",
      "Reset the memory of an creep",
      [
        { name: "id", type: "string" },
        { name: "roomName", type: "string" },
      ]
    );

    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "DeleteRoomMemoryCommand",
      "Remove an room out of the memory",
      [{ name: "id", type: "string" }]
    );
    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "DeleteStructureMemoryCommand",
      "Remove an structure out of the memory",
      [
        { name: "id", type: "string" },
        { name: "roomName", type: "string" },
      ]
    );
    helpMessage += ConsoleCommandsHandler.DescribeFunction(
      "DeleteCreepMemoryCommand",
      "Remove an creep out of the memory",
      [
        { name: "id", type: "string" },
        { name: "roomName", type: "string" },
      ]
    );
    helpMessage += "<br><br>EndOfList";
    helpMessage += "</span";
    return helpMessage;
  });

  // #endregion

  /**
   * Handles setting the console commands to the heap to used in the console.
   */
  public static AssignCommandsToHeap = FuncWrapper(
    function AssignCommandsToHeap(): void {
      global.help = ConsoleCommandsHandler.HelpCommand;

      global.resetGlobalMemory =
        ConsoleCommandsHandler.ResetGlobalMemoryCommand;
      global.resetRoomMemory = ConsoleCommandsHandler.ResetRoomMemoryCommand;
      global.resetStructureMemory =
        ConsoleCommandsHandler.ResetStructureMemoryCommand;
      global.resetCreepMemory = ConsoleCommandsHandler.ResetCreepMemoryCommand;

      global.deleteRoomMemory = ConsoleCommandsHandler.DeleteRoomMemoryCommand;
      global.deleteStructureMemory =
        ConsoleCommandsHandler.DeleteStructureMemoryCommand;
      global.deleteCreepMemory =
        ConsoleCommandsHandler.DeleteCreepMemoryCommand;
    }
  );
}
