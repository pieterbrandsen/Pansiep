########################################################################
Tasks
########################################################################

To execute a job a creep takes it needs to use tasks to finish it.

The following parts will be included:
- Movement
- Work
- Defense 

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
 
Movement
#########

There will be one function with 2 outputs. Its a InRoomMovement or OutOfRoomMovement based on if a room name parameter will be included.

Specific logic will be added to each function so it will be easier to debug specific functions.

Work actions
#########

A function to:

- Repair
- Harvest
- Build
- Upgrade 
- Dismantle 

Specific logic will be added to each function so it will be easier to debug specific functions.

Defense
#########

A function to:

- Heal
- Attack
- RangedAttack

Specific logic will be added to each function so it will be easier to debug specific functions.
