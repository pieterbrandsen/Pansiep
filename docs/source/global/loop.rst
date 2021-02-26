########################################################################
Loop
########################################################################


The loop will control the following:

- All rooms without and with vision

The following features will be included:

- Cache 
- Loop

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

Object cache
------------------------

If the cache of rooms is not filled or is expired the list will be rechecked and old/new values will be removed/added.
This is done to save cpu and not load all rooms each tick.

Loop
------------------------

Each tick a loop will be done though all the rooms in the cache.

On the loop the functions get called to run the objects.