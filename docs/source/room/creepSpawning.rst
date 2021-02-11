########################################################################
Creep spawning & requesting
########################################################################

Spawn creep based on what's needed, not to much and not too many.

The following features will be included:
- [ ] Next creep type
- [ ] Parts
- [ ] Spawns
- [ ] Queue
- [ ] Defense
- [ ] Spawning

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

Next creep type
================

Get needed creep type based on logic like amount of jobs and amount of creeps.

Parts
================

Get the optimal body the room can build or when there is almost no energy a basic body will be send.

Spawns
================

Basic spawn commands to do stuff like filtering or getting them all. 

Queue
================

Queue creep based on a priority value. Check if not a creep is already in queue before adding it again.

Defense
================

Enter defense mode when required and only spawn the required creeps or what is possible but the focus is then on energy in room and defending.

Spawning
================

Spawn a creep based on a few parameters that can be gathered from this part.