########################################################################
Stats
########################################################################

Save stats in memory to use for analyzing later, this is really usefully to analyse how the bot is performing.

The following parts will be included:
- [ ] Stats end point
- [ ] Stats deletion request
- [ ] Grafana board
- [ ] Stat average

********************
Function list
********************

.. csv-table::
  :header: Name, Description
  :widths: 30 70
  
  a, b

******************************
Performance related stats list
******************************

**Note:** This does not include cpu, check next table to see the cpu stats table

.. csv-table::
  :header: Name, Description, Path
  :widths: 30 40 40
  
  a, b, c

******************************
Cpu related stats list
******************************

.. csv-table::
  :header: Name, Description, Path
  :widths: 30 40 40
  
  a, b, c

******************************
Action related stats list
******************************

.. csv-table::
  :header: Name, Description, Path
  :widths: 30 40 40
  
  a, b, c

********************************************************
How is it going to work?
********************************************************

Stats endpoint
================

Send stat value with their path to this endpoint and run average function to average it out.

Stats deletion request
================

When a object with stats is not needed anymore the path should be sended and then deleted to save memory.

Grafana board
================

To visualize and get a better history viewer, a grafana board will be created. Here you can see all stats visualized and get a faster view of whats happening.

Stat average
================

Average stats to filter out noise. Based on a global value.