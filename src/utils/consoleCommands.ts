import { forEach } from "lodash";
import {
  InitializeCreepMemory,
  InitializeGlobalMemory,
  InitializeRoomMemory,
  InitializeStructureMemory,
} from "../memory/initialization";
import {
  RemoveCreep,
  RemoveRoom,
  RemoveStructure,
} from "../memory/garbageCollection";
import { FuncWrapper } from "./wrapper";
import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./statusGenerator";

type Param = { name: string; type: string };
export const DescribeFunction = FuncWrapper(function DescribeFunction(
  name: string,
  description: string,
  params?: Param[]
): FunctionReturn {
  let message = `<br><br>Function name: ${name}<br>Description: ${description}`;
  if (params && params.length > 0) {
    message += "<br>Params:";
    forEach(params, (param: Param) => {
      message += `<br>Name = ${param.name}, Type = ${param.type}`;
    });
  }
  message +=
    "<br>----------------------------------------------------------------";
  return FunctionReturnHelper(FunctionReturnCodes.OK, message);
});

export const ResetGlobalMemoryCommand = FuncWrapper(
  function ResetGlobalMemoryCommand(): number {
    return InitializeGlobalMemory().code;
  }
);

export const ResetRoomMemoryCommand = FuncWrapper(
  function ResetRoomMemoryCommand(id: string): number {
    return InitializeRoomMemory(id).code;
  }
);

export const ResetStructureMemoryCommand = FuncWrapper(
  function ResetStructureMemoryCommand(id: string, roomName: string): number {
    return InitializeStructureMemory(id, roomName).code;
  }
);

export const ResetCreepMemoryCommand = FuncWrapper(
  function ResetCreepMemoryCommand(id: string, roomName: string): number {
    return InitializeCreepMemory(id, roomName).code;
  }
);

export const DeleteRoomMemoryCommand = FuncWrapper(
  function DeleteRoomMemoryCommand(id: string): number {
    return RemoveRoom(id).code;
  }
);

export const DeleteStructureMemoryCommand = FuncWrapper(
  function DeleteStructureMemoryCommand(
    id: Id<Structure>,
    roomName: string
  ): number {
    return RemoveStructure(id, roomName).code;
  }
);

export const DeleteCreepMemoryCommand = FuncWrapper(
  function DeleteCreepMemoryCommand(id: string, roomName: string): number {
    return RemoveCreep(id, roomName).code;
  }
);

export const HelpCommand = FuncWrapper(function HelpCommand(): string {
  let helpMessage = "<span style='color:Cornsilk'>";
  helpMessage += "All functions accessible using the Console";
  helpMessage += DescribeFunction(
    "ResetGlobalMemoryCommand",
    "Reset all memory"
  ).response;
  helpMessage += DescribeFunction(
    "ResetRoomMemoryCommand",
    "Reset the memory of an room",
    [{ name: "id", type: "string" }]
  ).response;
  helpMessage += DescribeFunction(
    "ResetStructureMemoryCommand",
    "Reset the memory of an structure",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  ).response;
  helpMessage += DescribeFunction(
    "ResetCreepMemoryCommand",
    "Reset the memory of an creep",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  ).response;

  helpMessage += DescribeFunction(
    "DeleteRoomMemoryCommand",
    "Remove an room out of the memory",
    [{ name: "id", type: "string" }]
  ).response;
  helpMessage += DescribeFunction(
    "DeleteStructureMemoryCommand",
    "Remove an structure out of the memory",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  ).response;
  helpMessage += DescribeFunction(
    "DeleteCreepMemoryCommand",
    "Remove an creep out of the memory",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  ).response;
  helpMessage += "<br><br>EndOfList";
  helpMessage += "</span";
  return helpMessage;
});

export const AssignCommandsToHeap = FuncWrapper(
  function AssignCommandsToHeap(): FunctionReturn {
    global.help = HelpCommand;

    global.resetGlobalMemory = ResetGlobalMemoryCommand;
    global.resetRoomMemory = ResetRoomMemoryCommand;
    global.resetStructureMemory = ResetStructureMemoryCommand;
    global.resetCreepMemory = ResetCreepMemoryCommand;

    global.deleteRoomMemory = DeleteRoomMemoryCommand;
    global.deleteStructureMemory = DeleteStructureMemoryCommand;
    global.deleteCreepMemory = DeleteCreepMemoryCommand;

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);
