Welcome to PandaBot's documentation!
=========================================

.. note::
   Feel free to contact me on the Screeps slack at **@pandamaster** if you have any questions.

   `GitKraken Board <https://app.gitkraken.com/glo/board/YB7eUM0RFgBXNrw->`_
   
   *To contribute to this project please open a pull request/issue or contact me on slack.*

.. warning::
   There is currently no code yet so all functions/config/constants tables are empty!
   Expect change soon.

The goal of this page is to show each part of the bot
---------------------------------------------------------

There are three main categories. Keep those in mind, its going to be important later on.

1. Global
2. Room
3. Creep

Each of those categories execute code based on their category, they can communicate with each other but only one category up or down.

Click on a part to see detailed information on the workings of that part
Note: Each part can be found on multiple categories and their logic does change a little bit then.

All parts sorted by category
-----------------------------

.. toctree::
   :maxdepth: 1
   :caption: Global

   global/manager
   global/logger
   global/visuals
   global/config
   global/constants
   global/stats
   global/communication
   global/market
   global/memory
   global/consoleCommands

.. toctree::
   :maxdepth: 1
   :caption: Room

   room/config
   room/constants
   room/stats
   room/jobs
   room/market
   room/defending
   room/communication
   room/communicationStructure
   room/roomReading
   room/roomPlanner
   room/creepSpawning
   room/structureBuilding

.. toctree::
   :maxdepth: 1
   :caption: Creep

   creep/config
   creep/constants
   creep/stats
   creep/communication
   creep/creepSayings

   