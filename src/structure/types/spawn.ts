import { forEach, forOwn, reduce, isUndefined } from "lodash";
import CreepHelper from "../../creep/helper";
import RoomHelper from "../../room/helper";
import JobHandler from "../../room/jobs/handler";
import LogHandler from "../../utils/logger";
import MemoryInitializationHandler from "../../memory/initialization";
import RoomConstants from "../../utils/constants/room";
import GlobalConstants from "../../utils/constants/global";
import StructureHelper from "../helper";
import WrapperHandler from "../../utils/wrapper";

type JobActionObj = { usableCreeps: number; wantedCreeps: number };

export default class SpawnHandler {
  /**
   * Get job actions array that are not at max creeps.
   */
  private static GetJobActionsWithCreepNeed = WrapperHandler.FuncWrapper(
    function GetJobActionsWithCreepNeed(
      roomName: string,
      usePriorityJobs: boolean
    ): JobActionTypes[] {
      let jobs = JobHandler.GetAllJobs(roomName);

      const priorityJobs: Job[] = jobs.filter((j: Job) => j.hasPriority);
      if (usePriorityJobs && priorityJobs.length > 0) {
        jobs = priorityJobs;
      }

      const jobActionTypesObj: StringMap<JobActionObj> = {};
      forEach(jobs, (job: Job) => {
        if (!jobActionTypesObj[job.action])
          jobActionTypesObj[job.action] = { usableCreeps: 0, wantedCreeps: 0 };
        jobActionTypesObj[job.action].wantedCreeps +=
          job.maxCreeps - job.assignedCreepsNames.length;
      });

      const jobActionTypes: JobActionTypes[] = [];
      forOwn(jobActionTypesObj, (job: JobActionObj, key: string) => {
        let usableCreeps = 0;
        switch (key) {
          case "move":
            usableCreeps = CreepHelper.GetAllCreepsMemory(roomName, ["move"])
              .length;
            break;
          case "transfer":
          case "withdraw":
            usableCreeps = CreepHelper.GetAllCreepsMemory(roomName, [
              "transferring",
            ]).length;
            break;
          case "harvest":
          case "build":
          case "repair":
          case "dismantle":
          case "upgrade":
            usableCreeps = CreepHelper.GetAllCreepsMemory(roomName, ["work"])
              .length;
            break;
          case "attack":
            usableCreeps = CreepHelper.GetAllCreepsMemory(roomName, ["attack"])
              .length;
            break;
          case "claim":
            usableCreeps = CreepHelper.GetAllCreepsMemory(roomName, ["claim"])
              .length;
            break;
          case "heal":
            usableCreeps = CreepHelper.GetAllCreepsMemory(roomName, ["heal"])
              .length;
            break;
          default:
            break;
        }

        if (
          usableCreeps < RoomConstants.MaxCreepsPerCreepType &&
          usableCreeps < job.wantedCreeps
        ) {
          jobActionTypes.push(key as JobActionTypes);
        }
      });

      return jobActionTypes;
    }
  );

  /**
   * Return job type that needs to be fulfilled next spawn.
   */
  private static GetNextCreepType = WrapperHandler.FuncWrapper(
    function GetNextCreepType(
      roomName: string,
      usePriorityJobs = false
    ): CreepTypes {
      const room = RoomHelper.GetRoom(roomName);
      if (
        room &&
        (room.energyCapacityAvailable <= 300 ||
          (room.energyCapacityAvailable / 4 > room.energyAvailable &&
            room.energyCapacityAvailable > 300))
      ) {
        return CreepHelper.GetAllCreepsMemory(roomName, ["pioneer"]).length <
          RoomConstants.MaxCreepsPerCreepType * 1.5
          ? "pioneer"
          : "none";
      }

      const possibleJobActionTypes = SpawnHandler.GetJobActionsWithCreepNeed(
        roomName,
        usePriorityJobs
      );
      const possibleCreepTypes: CreepTypes[] = [];
      forEach(possibleJobActionTypes, (key: JobActionTypes) => {
        switch (key) {
          case "move":
            possibleCreepTypes.push("move");
            break;
          case "transfer":
          case "withdraw":
            possibleCreepTypes.push("transferring");
            break;
          case "harvest":
          case "build":
          case "repair":
          case "dismantle":
          case "upgrade":
            possibleCreepTypes.push("work");
            break;
          case "attack":
            possibleCreepTypes.push("attack");
            break;
          case "claim":
            possibleCreepTypes.push("claim");
            break;
          case "heal":
            possibleCreepTypes.push("heal");
            break;
          default:
            break;
        }
      });

      if (possibleCreepTypes.length === 0) return "none";

      if (possibleCreepTypes.includes("work")) return "work";
      if (possibleCreepTypes.includes("transferring")) return "transferring";
      if (possibleCreepTypes.includes("attack")) return "attack";
      if (possibleCreepTypes.includes("heal")) return "heal";
      if (possibleCreepTypes.includes("move")) return "move";
      return "claim";
    }
  );

  /**
   * Get unique creepName that is not yet defined in creep memory
   */
  private static GetUniqueName = WrapperHandler.FuncWrapper(
    function GetUniqueName(creepType: CreepTypes): string {
      const currentNames = Object.keys(Memory.creeps);
      const getName = () =>
        `${creepType}-${Math.floor(Math.random() * 100001)}`;

      let name: string | undefined;
      do name = getName();
      while (currentNames.includes(name));

      return name;
    }
  );

  /**
   * Calculate cost of complete body part by part.
   */
  private static CalcBodyCost = function CalcBodyCost(
    body: BodyPartConstant[]
  ): number {
    const bodyCost = reduce(body, (sum, part) => sum + BODYPART_COST[part], 0);
    return bodyCost;
  };

  /**
   * Generate body array based on starting body and body iterations.
   */
  private static GenerateBody = WrapperHandler.FuncWrapper(
    function GenerateBody(
      parts: BodyPartConstant[],
      bodyIteration: BodyPartConstant[],
      energyAvailable: number,
      maxLoopCount = 50
    ): BodyPartConstant[] {
      let body: BodyPartConstant[] = parts;
      let i = 0;

      while (
        SpawnHandler.CalcBodyCost(body) +
          SpawnHandler.CalcBodyCost(bodyIteration) <=
          energyAvailable &&
        body.length + bodyIteration.length <= MAX_CREEP_SIZE &&
        i < maxLoopCount
      ) {
        body = body.concat(bodyIteration);
        i += 1;
      }

      if (body.length === parts.length) body = [];

      return body;
    }
  );

  /**
   * Return a list of body parts that will be used to spawn inputted creep type
   */
  private static GetBodyParts = WrapperHandler.FuncWrapper(
    function GetBodyParts(
      creepType: CreepTypes,
      room: Room
    ): { parts: BodyPartConstant[]; bodyCost: number } {
      let body: BodyPartConstant[] = [];

      switch (creepType) {
        case "attack":
          body = SpawnHandler.GenerateBody(
            [],
            [TOUGH, MOVE, MOVE, ATTACK],
            room.energyAvailable
          );
          break;
        case "claim":
          body = SpawnHandler.GenerateBody(
            [],
            [MOVE, MOVE, CLAIM],
            room.energyAvailable
          );
          break;
        case "heal":
          body = SpawnHandler.GenerateBody(
            [],
            [MOVE, HEAL],
            room.energyAvailable
          );
          break;
        case "move":
          body = SpawnHandler.GenerateBody([], [MOVE], room.energyAvailable, 2);
          break;
        case "transferring":
          body = SpawnHandler.GenerateBody(
            [],
            [MOVE, CARRY, CARRY],
            room.energyAvailable
          );
          break;
        case "pioneer":
        case "work":
          body = SpawnHandler.GenerateBody(
            [],
            [MOVE, WORK, CARRY],
            room.energyAvailable
          );
          break;
        default:
          break;
      }

      return {
        parts: body,
        bodyCost: SpawnHandler.CalcBodyCost(body),
      };
    }
  );

  /**
   * Try to spawn creep from queue or a next creep type.
   */
  private static SpawnCreep = WrapperHandler.FuncWrapper(function SpawnCreep(
    spawn: StructureSpawn
  ): boolean {
    const roomName: string = spawn.room.name;
    let creepType: CreepTypes = "none";
    let usedQueue = false;

    if (Memory.rooms[roomName].spawnQueue.length === 0) {
      let nextCreepType = SpawnHandler.GetNextCreepType(roomName, true);
      if (nextCreepType !== "none") {
        creepType = nextCreepType;
      } else {
        nextCreepType = SpawnHandler.GetNextCreepType(roomName);
        if (nextCreepType !== "none") {
          creepType = nextCreepType;
        } else {
          return false;
        }
      }
    } else {
      creepType = Memory.rooms[roomName].spawnQueue.shift() as CreepTypes;
      usedQueue = true;
    }

    const name = SpawnHandler.GetUniqueName(creepType);
    const body = SpawnHandler.GetBodyParts(creepType, spawn.room);

    const spawnCreep = spawn.spawnCreep(body.parts, name);
    if (spawnCreep !== OK) {
      if (usedQueue) {
        Memory.rooms[roomName].spawnQueue.splice(0, 0, creepType);
      }
      return false;
    }

    const spawnExpenses =
      global.preProcessingStats.rooms[spawn.room.name].energyExpenses.spawn;
    if (isUndefined(spawnExpenses[creepType])) spawnExpenses[creepType] = 0;
    spawnExpenses[creepType] += body.bodyCost;

    LogHandler.Log(
      GlobalConstants.LogTypes.Debug,
      "src/rooms/spawning:SpawnCreep",
      `spawned a creep with the type: ${creepType}`
    );
    MemoryInitializationHandler.InitializeCreepMemory(
      roomName,
      name,
      creepType,
      true
    );
    return true;
  });

  /**
   * Execute an spawn
   */
  public static ExecuteSpawn = WrapperHandler.FuncWrapper(function ExecuteSpawn(
    str: StructureSpawn
  ): void {
    StructureHelper.ControlDamagedStructures(str, true);
    StructureHelper.KeepStructureFullEnough(
      str,
      100,
      RESOURCE_ENERGY,
      "transfer",
      true
    );

    if (str.spawning === null) SpawnHandler.SpawnCreep(str);
  });
}
