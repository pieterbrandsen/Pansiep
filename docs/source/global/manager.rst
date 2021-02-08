########################################################################
Manager
########################################################################


The manager will control the following:

- All rooms without and with vision
- Structures
- Creeps

The following parts will be included:

- Console commands
- Memory initialization
- Object cache
- Object loop

************************
Function list
************************

.. csv-table::
  :header: Name, Description
  :widths: 30 70
  
  a, b

************************
How is it going to work?
************************

Console commands
------------------------

Every ... ticks (defined in constants) there will be a initialization for the console commands.
Note: No console commands are used for the manager.

Memory initialization
------------------------

At the start of every tick there is a check if the global memory is not undefined, if this is the case the memory will be instantiated.

Object cache
------------------------

If the cache of objects is not filled or is expired the list will be rechecked and old/new values will be removed/added.
This is done to save cpu and not load all objects each tick.

Object loop
------------------------

Each tick a loop will be done though all the objects in the cache. It will be done in the following order:

1. Rooms
2. Structures
3. Creeps

On the loop the functions get called to run the objects.