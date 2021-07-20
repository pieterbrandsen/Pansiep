import { isUndefined, first, forEach, remove } from "lodash";
import FuncWrapper from "../../utils/wrapper";
import CreateJobHandler from "./create";
import RoomHelper from "../helper";
import CreepHelper from "../../creep/helper";
import StructureHelper from "../../structure/helper";
import UtilsHelper from "../../utils/helper";
import RoomConstants from "../../utils/constants/room";

export default class JobHandler {
  public static CreateJob = CreateJobHandler;

  /**
   * Return all jobs from @param room
   */
  public static GetAllJobs = FuncWrapper(function GetAllJobs(
    roomName: string,
    filterOnTypes?: JobActionTypes[]
  ): Job[] {
    const jobs = RoomHelper.GetRoomMemory(roomName)
      .jobs.filter((j) =>
        filterOnTypes ? filterOnTypes.includes(j.action) : true
      )
      .sort((a, b) => {
        return Number(a.hasPriority) - Number(b.hasPriority);
      });
    return jobs;
  });

  /**
   * Return all available jobs from @param room
   *
   */

  public static GetAvailableJobs = FuncWrapper(function GetAvailableJobs(
    roomName: string,
    requesterIsCreep: boolean,
    filterOnTypes?: JobActionTypes[]
  ): Job[] {
    const jobs = JobHandler.GetAllJobs(
      roomName,
      filterOnTypes
    ).filter((j: Job) =>
      requesterIsCreep
        ? j.assignedCreepsNames.length < j.maxCreeps
        : j.assignedStructuresIds.length < j.maxStructures
    );
    return jobs;
  });

  /**
   * Return closest job based on @param pos
   */
  public static GetClosestJob = FuncWrapper(function GetClosestJob(
    jobs: Job[],
    pos: RoomPosition
  ): Job {
    jobs
      .filter((job) => job.position)
      .forEach((job: Job) => {
        // eslint-disable-next-line
        job.position = UtilsHelper.RehydratedRoomPosition(
          job.position as RoomPosition
        );
      });

    const closestJob: Job = first(
      jobs.sort(
        (a: Job, b: Job) =>
          (a.position as RoomPosition).getRangeTo(pos) -
          (b.position as RoomPosition).getRangeTo(pos)
      )
    ) as Job;

    return closestJob;
  });

  /**
   * Switch creep jobs saved in memory
   */
  public static SwitchCreepSavedJobIds = FuncWrapper(
    function SwitchCreepSavedJobIds(
      creepMemory: CreepMemory,
      switchBack = false
    ): void {
      let oldId: Id<Job> | undefined;
      if (switchBack) {
        oldId = creepMemory.jobId;
        creepMemory.jobId = creepMemory.secondJobId;
        creepMemory.secondJobId = oldId;
      } else {
        oldId = creepMemory.secondJobId;
        creepMemory.secondJobId = creepMemory.jobId;
        creepMemory.jobId = oldId;
      }
    }
  );

  /**
   * Assigns new job to @param str
   */
  public static AssignNewJobForStructure = FuncWrapper(
    function AssignNewJobForStructure(
      str: Structure,
      filterOnTypes?: JobActionTypes[]
    ): boolean {
      const strId: Id<Structure> = str.id;
      const strMem = StructureHelper.GetStructureMemory(strId);
      let jobs: Job[] = [];

      if (filterOnTypes) {
        jobs = JobHandler.GetAvailableJobs(str.room.name, false, filterOnTypes);
      } else {
        switch (str.structureType) {
          case "tower":
            jobs = JobHandler.GetAvailableJobs(str.room.name, false, [
              "attack",
            ]);
            if (jobs.length === 0) {
              jobs = JobHandler.GetAvailableJobs(str.room.name, false, [
                "repair",
                "heal",
              ]);
            }
            break;
          default:
            break;
        }
      }

      if (jobs.length === 0) return false;

      const closestJob = JobHandler.GetClosestJob(jobs, str.pos);
      closestJob.assignedStructuresIds.push(strId);
      strMem.jobId = closestJob.id;
      return true;
    }
  );

  /**
   * Assigns new job to @param creep
   */
  public static AssignNewJobForCreep = FuncWrapper(
    function AssignNewJobForCreep(
      creep: Creep,
      filterOnTypes?: JobActionTypes[],
      forcedJob?: Job
    ): boolean {
      const creepMem = CreepHelper.GetCreepMemory(creep.name);
      if (forcedJob) {
        forcedJob.assignedCreepsNames.push(creep.name);
        creepMem.jobId = forcedJob.id;
        return true;
      }

      if (creepMem.secondJobId) {
        if (creepMem.jobId !== creepMem.secondJobId) {
          JobHandler.SwitchCreepSavedJobIds(creepMem, true);
        }
        return true;
      }

      let jobs: Job[] = [];
      if (filterOnTypes) {
        jobs = JobHandler.GetAvailableJobs(
          creep.room.name,
          true,
          filterOnTypes
        );
      } else {
        switch (creepMem.type) {
          case "attack":
          case "claim":
          case "move":
          case "heal":
            jobs = JobHandler.GetAvailableJobs(creep.room.name, true, [
              creepMem.type,
            ]);
            break;
          case "pioneer":
            jobs = JobHandler.GetAvailableJobs(
              creep.room.name,
              true,
              creep.store.getUsedCapacity() < creep.store.getCapacity()
                ? [
                    "harvest",
                    "transfer",
                    "dismantle",
                    "build",
                    "repair",
                    "dismantle",
                  ]
                : [
                    "transfer",
                    "dismantle",
                    "build",
                    "repair",
                    "dismantle",
                    "upgrade",
                  ]
            );
            break;
          case "transferring":
            jobs = JobHandler.GetAvailableJobs(creep.room.name, true, [
              "transfer",
            ]);
            break;
          case "work":
            jobs = JobHandler.GetAvailableJobs(
              creep.room.name,
              true,
              creep.store.getUsedCapacity() < creep.store.getCapacity()
                ? [
                    "harvest",
                    "dismantle",
                    "build",
                    "repair",
                    "dismantle",
                    "upgrade",
                  ]
                : ["dismantle", "build", "repair", "dismantle"]
            );
            break;
          default:
            break;
        }
      }

      if (jobs.length === 0) return false;

      const jobsGroupedByPrioritize: StringMap<Job[]> = {};
      let highestPriorityJobsNumber = 99;
      forEach(jobs, (j: Job) => {
        const num = RoomConstants.JobActionPriority[j.action];
        if (highestPriorityJobsNumber > num) {
          highestPriorityJobsNumber = num;
        }

        if (isUndefined(jobsGroupedByPrioritize[num]))
          jobsGroupedByPrioritize[num] = [];
        jobsGroupedByPrioritize[num].push(j);
      });

      const closestJob = JobHandler.GetClosestJob(
        jobsGroupedByPrioritize[highestPriorityJobsNumber],
        creep.pos
      );
      closestJob.assignedCreepsNames.push(creep.name);
      creepMem.jobId = closestJob.id;
      return true;
    }
  );

  /**
   * Get job by @param jobId
   */
  public static GetJob = FuncWrapper(function GetJobById(
    jobId: Id<Job>,
    roomName: string
  ): Job {
    const jobs = JobHandler.GetAllJobs(roomName);
    const job: Job | undefined = jobs.find((j: Job) => j.id === jobId);
    return job as Job;
  });

  /**
   * Update full job list with @param jobs
   */
  public static OverwriteJobList = FuncWrapper(function OverwriteJobList(
    roomName: string,
    jobs: Job[]
  ): boolean {
    Memory.rooms[roomName].jobs = jobs;
    return true;
  });

  /**
   * Unassign job from creep or structure
   */
  public static UnassignJob = FuncWrapper(function UnassignJob(
    jobId: Id<Job>,
    id: Id<Structure> | string,
    roomName: string
  ): boolean {
    const job = JobHandler.GetJob(jobId, roomName);
    const removedStructuresIds = remove(
      job.assignedStructuresIds,
      (strId: string) => strId === id
    );
    const removedCreepsIds = remove(
      job.assignedCreepsNames,
      (name: string) => name === id
    );
    // UpdateJobById(jobId, job, roomName);

    if (removedCreepsIds.length > 0) {
      const creepMemory = CreepHelper.GetCreepMemory(id);
      if (creepMemory.jobId === jobId) {
        creepMemory.jobId = undefined;
      } else if (creepMemory.secondJobId === jobId) {
        creepMemory.secondJobId = undefined;
      }
      // UpdateCreepMemory(id, creepMem);
    }
    if (removedStructuresIds.length > 0) {
      const structureMemory = StructureHelper.GetStructureMemory(
        id as Id<Structure>
      );
      structureMemory.jobId = undefined;
      // UpdateStructureMemory(id as Id<Structure>, strMem);
    }

    return true;
  });

  /**
   * Delete job and unassign job for all creep and structure
   */
  public static DeleteJob = FuncWrapper(function DeleteJobById(
    id: Id<Job>,
    roomName: string
  ): boolean {
    const jobs = JobHandler.GetAllJobs(roomName);
    const index = jobs.findIndex((j) => j.id === id);
    forEach(jobs[index].assignedCreepsNames, (name: string) => {
      const creepMemory = CreepHelper.GetCreepMemory(name);
      if (creepMemory.jobId === id) {
        creepMemory.jobId = undefined;
      } else {
        creepMemory.secondJobId = undefined;
      }

      // UpdateCreepMemory(name, creepMem);
    });
    forEach(jobs[index].assignedStructuresIds, (strId: Id<Structure>) => {
      const structureMemory = StructureHelper.GetStructureMemory(strId);
      structureMemory.jobId = undefined;
      // UpdateStructureMemory(strId, strMem);
    });
    remove(jobs, (j: Job) => j.id === id);
    JobHandler.OverwriteJobList(roomName, jobs);
    return true;
  });

  public static AddJob = FuncWrapper(function AddJob(job: Job): boolean {
    const jobs = JobHandler.GetAllJobs(job.roomName);
    jobs.push(job);
    return true;
  });
}
