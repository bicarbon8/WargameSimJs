# WargameSimJs
This project creates a Javascript based strategy game that can be played between
two players within a browser

## Features
- Turn-based play
- 3D visualisation of characters and playing field
- Priority, Movement, Shooting and Fighting phases of play
- customisable teams of players
- customisable playing fields
- automatic detection of players within battle range
- daytime and nighttime pass as the game progresses

## To Do
- during shooting phase, detect when objects or opponents are in the way
- calculate distances in terms of gameboard spaces moved
- prevent travel through existing players
- bypass game phases if players cannot act during the phase (due to being
    engaged in battle or otherwise)
- allow players to specifiy a number of points for the game (points are
    subtracted for each player added depending on player cost)
- create UI for player selection
- when all players of a team are defeated end the game
- implement handling of Might, Will and Fate point usage during battles
- better integration of menus into gameplay
- highlight the area that the selected player can move to during movement phase
- allow saving a game to localstorage or file for continuation later
- allow undos
- handle irregularly shaped playing fields
- add textures
- add props to the playfield such as fences, trees, hedges, rocks, etc.
