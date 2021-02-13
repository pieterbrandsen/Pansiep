########################################################################
Jobs
########################################################################

A smart job managing system that sends a complete job instead of a single action that requires completion. 
Not all jobs are multi targeted!

The following features will be included:
- Updating
- Caching
- CRUD endpoint
- Request new creep

********************
Function list
********************

.. csv-table::
  :header: Name, Description
  :widths: 30 70
  
  a, b


************************
How is it going to work?
************************

Updating / CRUD endpoint
=========================

Check if cache of jobs has not expired because executing command.

CRUD 
----------
This is used for external sources to do operations on the job list.

C: Create
R: Read
U: Update
D: Delete

Return response model for CRUD action:

- ResponseCode
- Message
- Jobs

Caching
=============

Each request to the jobs will trigger checking if the cache did not expire before doing their operation.

This is usefully to not check every ... ticks for all actions and save cpu.

Request new creep
==========================

When a job is created it should check if it can assign a creep to that job. If this is not the case and there is a backlog of jobs a new creep should be requested.