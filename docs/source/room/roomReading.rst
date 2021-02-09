########################################################################
Room reading
########################################################################

To get a readable map for the bot this part will be used. It will convert the map of the requested room to a more readable format.

The following parts will be included:
- Terrain return
- Terrain filter
- Analyse map
- Get weak spots
- Get structures in range
- Get best spots
- Get dangerous structures


********************
Function list
********************

.. csv-table::
  :header: Name, Description
  :widths: 30 70
  
  a, b
  

********************
How is it going to work?
********************
Terrain returned
========================

Get room terrain

Terrain filter
========================

Filter terrain types or range on ``Terrain return``

Analyse map
========================

Analyse map and use the functions below to get requested output.

Get weak spots
-------------------
The same analyzing to get best spots for defense structures will be used too here but then inverted to get the weak spots.

Like hit points and structures needed to kill to get inside the base.

Get structures in range
----------------------------
Return all structures in specified range, filter on type and function is possible.

Get best spot
-------------------
Based on what's needed the best spots in a range will be gathered and the best spot in the list will be returned.

Get dangerous structures
-------------------------------------
To optimize attacking the most dangerous structures for creeps will be gathered and focussed on to destroy first.