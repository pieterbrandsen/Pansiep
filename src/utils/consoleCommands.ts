import { forEach } from "lodash";
import MemoryInitializationHandler from "../memory/initialization";
import GarbageCollectionHandler from "../memory/garbageCollection";
import WrapperHandler from "./wrapper";

type Param = { name: string; type: string };

export default class ConsoleCommandsHandler {
  /**
   * Return an html string that describes an function based on params.
   */
  private static DescribeFunction = WrapperHandler.FuncWrapper(
    function DescribeFunction(
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
    }
  );

  // #region Commands
  private static ResetGlobalMemoryCommand = WrapperHandler.FuncWrapper(
    function ResetGlobalMemoryCommand(): void {
      return MemoryInitializationHandler.InitializeGlobalMemory();
    }
  );

  private static ResetRoomMemoryCommand = WrapperHandler.FuncWrapper(
    function ResetRoomMemoryCommand(id: string): void {
      return MemoryInitializationHandler.InitializeRoomMemory(id);
    }
  );

  private static ResetStructureMemoryCommand = WrapperHandler.FuncWrapper(
    function ResetStructureMemoryCommand(roomName: string, id: string): void {
      return MemoryInitializationHandler.InitializeStructureMemory(
        roomName,
        id
      );
    }
  );

  private static ResetCreepMemoryCommand = WrapperHandler.FuncWrapper(
    function ResetCreepMemoryCommand(roomName: string, id: string): void {
      return MemoryInitializationHandler.InitializeCreepMemory(roomName, id);
    }
  );

  private static DeleteRoomMemoryCommand = WrapperHandler.FuncWrapper(
    function DeleteRoomMemoryCommand(roomName: string): void {
      GarbageCollectionHandler.RemoveRoom(roomName);
    }
  );

  private static DeleteStructureMemoryCommand = WrapperHandler.FuncWrapper(
    function DeleteStructureMemoryCommand(
      roomName: string,
      id: Id<Structure>
    ): void {
      GarbageCollectionHandler.RemoveStructure(roomName, id);
    }
  );

  private static DeleteCreepMemoryCommand = WrapperHandler.FuncWrapper(
    function DeleteCreepMemoryCommand(id: string, roomName: string): void {
      GarbageCollectionHandler.RemoveCreep(roomName, id);
    }
  );

  private static HelpCommand = WrapperHandler.FuncWrapper(
    function HelpCommand(): string {
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
    }
  );

  // #endregion

  /**
   * Handles setting the console commands to the heap to used in the console.
   */
  public static AssignCommandsToHeap = WrapperHandler.FuncWrapper(
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
