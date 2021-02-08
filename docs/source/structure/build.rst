########################################################################
Building
########################################################################

Request to build structure. Adds job to job list for a creep to pickup.

The following parts will be included:
- Structure building
- Job adding
- Creep notifying

********************
Function list
********************

.. csv-table::
  :header: Name, Description
  :widths: 30 70
  
  a, b

********************
How is it going to work:
********************

Structure building
=====================

Runs build construction site on room and executes the rest of the code if successfully placed.

Job adding
=====================

Adds job to list with the required information.

Creep notifying
=====================

After the job and structure was OK, creeps without a job and in need of one gets notified there is a new job to skip wait times.