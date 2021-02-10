####################################
Welcome to PandaBot's documentation!
####################################

.. warning::
   There is currently no code yet so all functions/config/constants tables are empty!
   Expect change soon.

.. note::
   This documentation is about a game called `Screeps <https://screeps.com>`_ which is a JS based Real time MMO.
   To read more about the game go to their `Docs <https://docs.screeps.com/index.html>`_ or `API <https://docs.screeps.com/api/>`_

   `GitKraken Board <https://app.gitkraken.com/glo/board/YB7eUM0RFgBXNrw->`_
   
   Feel free to contact me on the Screeps slack at **@pandamaster** if you have any questions.

   *To contribute to this project please open a pull request/issue or contact me on slack.*


================================
Short bot description
================================

The bot is focussed on reliability and communication between the parts.

To fullfil the needs of the colony there will be complete jobs in each room to be fulfilled by creeps.
Based on the situation and job list the needed creeps get spawned or recycled.

Using the communication the rooms and creeps can communicate with each to create a system where on a attack or job overflow. When the room can't manage something he can request help without much hassle.

================================================================
Part categories
================================================================

There are four categories. Keep those in mind, its going to be important later on.

1. Global
2. Room
3. Structure
4. Creep

Each of those categories execute code based on their category, they can communicate with each other.

Note: Each part can be found on multiple categories and their logic does change a little bit then.

================================================================
All parts sorted by category
================================================================

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
   :caption: Structure

   structure/build
   structure/communication


.. toctree::
   :maxdepth: 1
   :caption: Creep

   creep/config
   creep/constants
   creep/stats
   creep/communication
   creep/tasks
   creep/creepSayings

.. toctree::
   :maxdepth: 1
   :caption: PandaBot

   CONTRIBUTING
   CODE_OF_CONDUCT