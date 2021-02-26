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
  function ResetGlobalMemoryCommand(): FunctionReturn {
    return InitializeGlobalMemory();
  }
);

export const ResetRoomMemoryCommand = FuncWrapper(
  function ResetRoomMemoryCommand(id: string): FunctionReturn {
    return InitializeRoomMemory(id);
  }
);

export const ResetStructureMemoryCommand = FuncWrapper(
  function ResetStructureMemoryCommand(
    id: string,
    roomName: string
  ): FunctionReturn {
    return InitializeStructureMemory(id, roomName);
  }
);

export const ResetCreepMemoryCommand = FuncWrapper(
  function ResetCreepMemoryCommand(
    id: string,
    roomName: string
  ): FunctionReturn {
    return InitializeCreepMemory(id, roomName);
  }
);

export const DeleteRoomMemoryCommand = FuncWrapper(
  function DeleteRoomMemoryCommand(id: string): FunctionReturn {
    return RemoveRoom(id);
  }
);

export const DeleteStructureMemoryCommand = FuncWrapper(
  function DeleteStructureMemoryCommand(
    id: string,
    roomName: string
  ): FunctionReturn {
    return RemoveStructure(id, roomName);
  }
);

export const DeleteCreepMemoryCommand = FuncWrapper(
  function DeleteCreepMemoryCommand(
    id: string,
    roomName: string
  ): FunctionReturn {
    return RemoveCreep(id, roomName);
  }
);

export const HelpCommand = FuncWrapper(function HelpCommand(): string {
  let helpMessage = "<span style='color:Cornsilk'>";
  helpMessage += "All functions accessible using the Console";
  helpMessage += DescribeFunction(
    "ResetGlobalMemoryCommand",
    "Reset all memory"
  );
  helpMessage += DescribeFunction(
    "ResetRoomMemoryCommand",
    "Reset the memory of an room",
    [{ name: "id", type: "string" }]
  );
  helpMessage += DescribeFunction(
    "ResetStructureMemoryCommand",
    "Reset the memory of an structure",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  );
  helpMessage += DescribeFunction(
    "ResetCreepMemoryCommand",
    "Reset the memory of an creep",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  );

  helpMessage += DescribeFunction(
    "DeleteRoomMemoryCommand",
    "Remove an room out of the memory",
    [{ name: "id", type: "string" }]
  );
  helpMessage += DescribeFunction(
    "DeleteStructureMemoryCommand",
    "Remove an structure out of the memory",
    [
      { name: "id", type: "string" },
      { name: "roomName", type: "string" },
    ]
  );
  helpMessage += DescribeFunction(
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
