---
layout: page
title: "JZTScript Reference"
---

JZTScript Reference Manual
==========================

Table of Contents
-----------------

* [Introduction](#introduction)
* [Creating a Scriptable Thing](#creating-a-scriptable-thing)
* [Creating a new Script](#creating-a-new-script)
* [Script Format](#script-format)
   * [Comments](#comments)
   * [Labels](#labels)
* [Command Reference](#command-reference)
   * [Directions](#directions)
   * [Direction Modifiers](#direction-modifiers)
   * [Colors](#colors)
   * [Things](#things)
   * [Expressions](#expressions)
   * [Music](#music)
   * [Command List](#command-list)

-------

Introduction
------------

Creating your own JZT Game World is easy with its built-in items, enemies, and terrains, but sometimes your game needs something special that can't be done with the build-in things. Perhaps you'd like a shopkeeper that trades gems for items, for example, or a special button that unlocks a gate and lets loose a hoarde of snakes. There are a lot of creative concepts that you can include in your JZT Game Worlds, and JZTScript is what lets that happen.

JZTScript is simple programming language used to program Scriptable things in JZT. A lot of game interactions are scripted using JZTScript. For example, in The Village of JZT, everything from the Dancing Trees in the Marsh, to the pedestals on which you place the Gems of Illumination in the cave are created using JZTScript.

This manual will describe everything you need to know to get started with JZTScript and create your own special interactions in your game. So let's get started!

Creating a Scriptable Thing
---------------------------

Everything in JZT is a, well, Thing! A segment of a wall is a Thing, a gem is a Thing, a lion is a Thing... I suspect you're getting the idea here. One type of Thing is a little more special than the others, though, and it's known as a Scriptable Thing.

*This section is incomplete. More details to come*

Creating a new Script
---------------------

To create a new script, click the *Scripts* tab in the JZT Game World Editor and click the *New Script* button. You'll be prompted for a name to call the script. Choose a good name so that you'll know exactly which behaviours you want to attach to your Scriptable Things.

You can create as many scripts on a board as you'd like, but your script will only be available on that board. If you want Scriptable Things to use a script that was created on another board, you'll need to create a copy of that script on the new board.

-------

Script Format
-------------

Each script is made up of lines that are executed one-after-another until your script completes. Each line can either be a comment, label, or command, which I'll explain briefly below:

### Comments

Comments are just reminders for you, the programmer! They don't make your Scriptable Things do anything, but they are good for leaving yourself notes about what a script does or to help others understand your scripts if you ever want to collaborate on a world with friends.

Comments start with two forward slashes and can contain any text you like. They can also occur at the end of a line, even if that line is a label or command. Neat! Here's some examples of comments:

    // This is a comment
    :touch // This is a comment after a label
    go north // And this is a label after a command

### Labels

Normally, commands in your script are executed one-after-another. Sometimes you might want to jump back to the start of a script, though, or have parts of your script execute only when triggered by something else. (For example, when you touch or shoot a Scriptable Thing). To do this, you can use labels!

Labels are lines that start with a colon (:) followed by a name of that label. Once you create a label, your script can "jump" to it by its name. Your script can also jump to these labels in response to receiving a "message" from the game or from another Scriptable. You can name labels anything you'd like, but it can't have any spaces. Here's an example of a label:

    :mylabel

Easy, right?

In addition to whatever label names you come up with, JZT has some names that mean something special. These represent common messages that your script can receive. These messages are as follows:

touch
: JZT will jump to this label whenever the player *touches* a Scriptable Thing.

shot
: JZT will jump to this label whenever the player or other Scriptables *shoots* a Scriptable Thing.
: Note that bullets from built-in enemies like lions and spinning guns will *not* cause a script to jump to this label.

bombed
: JZT will jump to this label whenever a Scriptable Thing is caught in a bomb's explosion.

thud
: JZT will jump to this label whenever a Scriptable Thing runs into a wall while walking.

enter
: JZT will jump to this label whenever the player enters a new board (either by passage or by walking off the edge of the screen).

Lava
: JZT will jump to this label whenever a Scriptable Thing finds itself on lava.

-------

Command Reference
-----------------

### Directions
Many commands make use of directions. Whenever a direction is required, you can specify it using any of the following:

north, n
east, e
south, s
west, w
: Compass directions.

seek
: Whichever direction is toward the player's position.

smart
: Whichever direction is toward the player's position, accounting for obstacles that may be in the way.

flow
: The direction in which a Scriptable Thing is currently walking.

rand
: A random compass direction.

randf
: A random direction that is available for movement (that is, there isn't an obstacle in the way).

randb
: A random direction that is blocked for movement (that is, there is an obstacle in the way).

randew
: Either east or west, randomly.

randns
: Either north or south, randomly.

randne
: Either north or east, randomly.

### Direction Modifiers

Directions can also be modified by placing one or more Direction Modifiers in front of it:

cw
: Clockwise of the specified direction
: Example: `cw north` would represent the same as `east`.
: Example: `cw randne` would represent either east or `south`, randomly.

ccw
: Counterclockwise of the specified direction.
: Example: `ccw north` would represent the same as `west`.
: Example: `ccw randne` would represent either `north` or `west`, randomly.

opp
: Opposite of the specified direction.
: Example: `opp seek` would represent a direction away from the player.
: Example: `opp flow` would represent the opposite direction that a Scriptable Thing is moving in.
: Example: `ccw opp seek` would represent a direction counterclockwise to the direction away from the player.
: Example: `opp randne` would represent either `south` or `west`, randomly.

rndp
: Randomly perpendicular to a provided direction.
: Example: `rndp north` would represent either `east` or `west`, randomly.
: Example: `rndp flow` would represent either a 90 or 270 degree turn from the direction that a Scriptable Thing is moving in.

### Colors

Colors can be specified using the following words. Note that colors can be in either upper or lowercase, but shouldn't contain any spaces. (So "BrightBlue" must always be specified without a space.)

* Black
* Blue
* Green
* Cyan
* Red
* Magenta
* Brown
* White
* Grey
* BrightBlue
* BrightGreen
* BrightCyan
* BrightRed
* BrightMagenta
* Yellow
* BrightWhite

### Things

The following "things" can be identified in JZTScript:

* Empty
* ActiveBomb
* Ammo
* Bear
* Blinker
* BlinkWall
* Bomb
* Boulder
* BreakableWall
* Bullet
* Centipede
* Conveyor
* Door
* Duplicator
* Explosion
* FakeWall
* Forest
* Gem
* GeoFence
* Heart
* InvisibleWall
* Key
* Lava
* LineWall
* Lion
* Passage
* Player
* Pusher
* Ricochet
* River
* Ruffian
* Scriptable
* Signpost
* SliderEw
* SliderNs
* Snake
* SolidWall
* Spider
* SpiderWeb
* SpinningGun
* Teleporter
* Text
* ThrowingStar
* Tiger
* Torch
* Wall
* Water

### Expressions

Some JZTScript commands use expressions to determine whether or not to take a certain action. Expressions will evaluate to either `true` or `false`. The following expression types can be used:

`not <expression>`
: Evalues to `true` if the provided expression evalues to `false`.
: Example `not adjacent`: Evaluates to true if the player is not immediately adjacent to the current Scriptable Thing, otherwise evalues to `false`.

`adjacent`
: Evalues to `true` if the player is immediately adjacent to the current Scriptable Thing, otherwise evalues to `false`.

`blocked <direction>`
: Evalues to `true` if the current Scriptable Thing is blocked in a provided direction, otherwise it evalues to `false`.
: Example: `blocked n` Evalues to true if the Scriptable Thing has an obstacle blocking its way to the north.
: Example: `blocked opp seek` Evaluates to true if the Scriptable Thing is blocked in the direction away from the player.

`aligned <direction>`
: Evalues to `true` if the player is aligned with the current Scriptable Thing in a provided direction, otherwise it evalues to `false`.
: Example: `aligned north`: Evalues to true if the player is vertically aligned with the current Scriptable Thing in the northerly direction.

`peep [distance]`
: Evalues to `true` if there is a line of sight between the player and the current Scriptable Thing. (That is to say, no walls or objects appear within a straight line between the two.) An optional distance can be provided, which signifies that the player must be at most that many spaces away from the Scriptable Thing for this to evaluate to `true`.
: Example `peep 5` evalues to true if the player can be seen within five spaces of the current Scriptable Thing.

`exists [count] <thing>`
: Evalues to `true` if the current board contains any of the specified thing, otherwise evalues to `false`. An optional number can be specified, in which case this expression only evalues to `true` if there are at least that many of the specified thing on the board.
: Example `exists 5 lion`: Evalues to `true` if there are at least five lions on the current board.
: Example `exists red gem`: Evalues to `true` if there are any red gems on the current board.

`<counter> [<, >, <=, >=, =] <number>`
: Evalues to `true` if a game counter is tested according to the provided mathematical test operators.
: Example `health >= 10` evalues to `true` if the player's health is 10 or higher.
: Example `gems = 5` evalues to `true` only if the player's gem count is exactly 5.
: Example `ammo < 20` evalues to `true` only if the player has less than 20 ammo shots left.

`lit`
: Evaluates to `true` if the current Scriptable Thing is either on a light board, or within the radius of a torch.

### Music

JZT can play sound effects and music using a simple format. Musical instructions are provided within double quotes. Each character in the notation has the following purpose. Spaces are ignored.

* T: All notes that follow will be played as 1/32 notes
* S: All notes that follow will be played as 1/16 notes
* I: All notes that follow will be played as 1/8 notes
* Q: All notes that follow will be played as 1/4 notes
* H: All notes that follow will be played as 1/2 notes
* W: All notes that follow will be played as whole notes
* 3: The following 3 notes will be played as a triplet
* +: Increases the current octave
* -: Decreases the current octave
* .: The following note will be played in time-and-a-half
* X: Rest
* C-B: Plays a note on the traditional melodic scale
* \#: The previous note is modified as a sharp note
* !: The previous note is modified as a flat note
* 0: Percussive tick
* 1: Percussive tweet
* 2: Percussive cowbell
* 4: Percussive high snare
* 5: Percussive high woodblock
* 6: Percussive low snare
* 7: Percussive low tom
* 8: Percussive low woodblock
* 9: Percussive bass

Example: `"c e g + c e g# x 0"` Plays the notes c, e, then g in succession, increases the octave by one, then plays the notes c, e, and g-sharp, followed by a rest and a percussive tick.

### Command List

The following commands can be used in your JZTScript to enact various behaviours. Most commands start with a word and are followed by a sequence of parameters. In this guide, optional parameters are specified by `[square brackets]` and required parameters are specified by `<angle brackets>`.

This guide also contains examples of each command.

`Become [color] <thing>`
: Turns a Scriptable Thing into something else, as defined by an optional color and Thing type.
: Example: `become yellow gem` would cause a Scriptable Thing running this command to turn into a yellow gem.
: Note that once a Scriptable Thing `becomes` something else, the Scriptable will be removed from the board and its script will no longer continue.

`Change [color] <thing> [color] <thing>`
: Turns all of one type of Thing on the board into another type.
: Example: `change ammo red gem` would turn all ammo on the board into red gems.
: Example: `change yellow gem blue gem` would turn all yellow gems into blue gems.
: Example: `change blue wall empty` would turn all blue walls into empty spaces.

`Char <character index>`
: Changes a Scriptable Thing's character into another one. In JZT, each character or symbol has a number.
: Example: `char 2` would change this Scriptable Thing to look like a solid happy face
: Example: `char 14` would change this Scriptable Thing to look like a musical note

`Color <color>`
: Changes a Scriptable Thing's color.
: Example: `color brightred` would change this Scriptable Thing to a bright red color
: Example: `color blue` would change this Scriptable Thing to a dark blue color

`Die`
: Causes the current Scriptable Thing to be removed from the board.
: Note that once a Scriptable Thing dies, its script will no longer be executed.

`End`
: Causes the current Scriptable Thing to stop executing its script.
: Script execution may continue again if your Scriptable Thing receives a message that causes execution to jump to a label.

`Go (<direction> [count])`
: Causes the current Scriptable Thing to move in a provided direction. If you specify a number of times to move, it will move once per execution cycle until the specified number is reached. If the Scriptable Thing is blocked from moving, it will continue trying to move during each of the next execution cycles until it is able. (That is, any subsequent commands won't execute until it is able to successfully move as directed.)
: You can give a `go` command multiple directions by specifying each direction with commas.
: Example: `go north 5` would go north five spaces, one space at a time at the Scriptable Thing's current speed.
: Example: `go n, s, e 2, w` would go north one space, south one space, east two spaces, and west one space (each move will happen one space at a time).
: Example: `go opp seek 3` would go three spaces away from the player

`Give <number> <counter>`
: Increases a named counter's value by a specified number.
: Example: `give 5 ammo` will increment the player's ammo by 5 shots.
: Example: `give 10 health` will increase the player's health by 10 units.
: Example: `give 1 superstar` would increase a game counter called "superstar" by 1.

`If <expression> <label>`
: Evaluates a provided expression, and jumps to a provided label if the expression evalutes to true.
: Example: `if exists 5 red gem dosomething` would jump to a label called "dosomething" if there are at least 5 red gems on the current board.
: Example: `if superstar >= 1 congratulate` would jump to a label called "congratulate" if there is a game counter called "superstar" whose value is one or higher.

`Lock`
: Causes the Scriptable Thing to no longer be able receive messages from the game or other Scriptables.
: Messages can still be sent from the Scriptable Thing to itself, however.

`Play "<song>"`
: Plays some musical notes.
: The syntax for writing music is described in another section.
: Example: `play "cdefgab+c"` would play an octave of notes.

`Put <direction> [color] <thing>`
: Places a new Thing on the board in a given direction. If there's already something in that space, it may be pushed out of the way (if it's a pushable type of Thing). If the space is occupied and nothing can be pushed out of the way, then nothing will be put there. Putting an `empty` Thing will erase any Thing that's already there.
: Example: `put s blue gem` would put a blue gem south of the current Scriptable Thing's position.
: Example: `put n empty` would erase whatever Thing is north of the current Scriptable Thing's position.

`Scroll [bold] "message" [label]`
: Pops up a scrollable text area on the screen with a provided message. You can optionally make the message appear "bold" (which is to say brighter and centered on the lines). Multiple consecutive `scroll` commands will be added to the same scroll on the screen. (That is, if you have two scroll commands, both messages will appear in a single scroll presented to the user.)
: Your text can also have an optional label. If you specify a label, your Scriptable Thing will jump to that label in the script when the user selects it. This lets you provide actions and options in your scrolls.
: Example: `scroll bold "The troll speaks..."` will pop up a scroll on the screen with some white, centered text.
: Example: `scroll "Buy some gems" buygems` Will pop up a scroll on the screen with an option to buy some gems. If the player selects this message, the active ScriptableThing will jump to a label called "buygems."

`Send [scriptable name] <message>`
: Sends a "message" to Scriptable Things with a provided name (there can be more than one), or jumps to a label if no name is provided.
: Example: `send loop` Jumps to a label called "loop" for the current Scriptable Thing's script.
: Example: `send troll die` Sends a "die" message to all Scriptable Things called "troll," causing these Scriptable Things to jump to their "die" label at the next execution cycle.

`Set [number] <counter>`
: Sets a game counter's value to a provided numeric value. If no numeric value is specified, it is assumed to be 1.
: Example `set 10 health` The player's health will be set to exactly 10.
: Example `set 0 stars` Reduces the custom "stars" counter to zero.

`Speed <number>`
: Adjusts the Scriptable Thing's speed to a new value.
: Example `speed 5` The Scriptable Thing's execution speed with be set to 5.

`Take <number> <counter> [label]`
: Subtracts a specified number from a provided game counter. Note that counters can never be less than zero, so attempting to take 10 from a counter whose value is 5 will result in the counter being 0 at the end of the operation if no label is provided.
: When a label is provided, the subtraction will only occur if the counter has a high enough value to be fully subtracted. Otherwise, the script will jump to the provided label.
: Example `take 5 health` Reduces the player's health by 5 (ending the game if the user has less than 5 health to begin with).
: Example `take 10 gems toopoor` Attempts to reduce the player's "gems" counter by 10; if the player doesn't have enough gems, the counter will stay at its initial value, but the script will jump to a label called "toopoor."

`Throwstar <direction>`
: Launches a throwing star in a provided direction.
: Example: `throwstar opp seek` Launches a throwing star in the opposite direction of the player.

`Torch [radius]`
: Surrounds the current Scriptable Thing with a torch glow, illuminating the area in dark rooms.
: An optional radius can be specified for the glow.
: Example `torch 5` Creates an illuminated circle with a radius of 5 vertical (and 10 horizontal, since tiles are double-height in JZT) spaces around the current Scriptable Thing.

`Try (<direction> [count])`
: Try works very simmilarly to the `Go` command, except if the Scriptable Thing is blocked from movement, it will ignore that movement and continue. (To illustrate the difference, let's say you have a Scriptable Thing with a wall placed directly north of it. If the Scriptable Thing is instructed to `try n, e`, it will try to move north, fail to do so because of the wall, and then will move east one space at the next execution cycle. If that same Scriptable Thing were given a `go n, e` command, it would try to move north, fail to do so because of the wall, and then continue to try to move north until the wall is removed and it's able to move north.)
: Example `try n 5` Tries to move north five times.
: Example `try s 3, e, n 5` Tries to move south three times, then east once, then north five times.

`Restore <label>`
: Restores a single, previously 'zapped' label, in the reverse order than they were zapped.
: Example `restore touch` Turns the most recently "zapped" touch label active again.

`Say <message>`
: Displays a flashing message at the bottom of the screen for a few seconds.
: Example `say "Hello, there!"` displays the words "Hello, there!" at the bottom of the screen for a few seconds.

`Shoot <direction>`
: Shoots a bullet in a provided direction.
: Example `shoot north` Shoots northward
: Example `shoot seek` Shoots toward the player.

`Stand`
: Causes the current Scriptable Thing to stop walking, if it's walking in a given direction.

`Unlock`
: Unlocks the current Scriptable Thing so that is can receive messages.

`Victory`
: Ends the game with a victory state, indicating that the player has won! This will cause the game to end and the victory screen to be displayed.

`Wait <number>`
: Causes the current Scriptable Thing to halt command execution for a provided number of execution cycles. The Scriptable Thing may still receive messages during this time.
: Example `wait 5` Stops executing commands for 5 cycles

`Walk <direction>`
: Causes the current Scriptable Thing to start walking in a given direction. It will move one space in that direction for every game cycle until told to either stand or walk in a different direction.
: Example: `walk seek` Walk in the direction toward the player. (Note, if the player moves, this Scriptable Thing will continue to walk in the direction it was walking; it won't change course to follow the player unless explicitly told to walk in a new direction.)

`Zap <label>`
: Zaps a single label with a provided name, rendering it ineffective. Zapped labels cannot be jumped to, even if a message is received. Labels can be unzapped using the `restore` command. If there are multiple labels with the same name, only the first unzapped label will be zapped.
: Example `zap touch` Finds the first occurrence of a label named "touch" in the script, and renders it ineffective. This means that the second "touch" label will then be jumped to the next time that Scriptable Thing receives a touch message.
