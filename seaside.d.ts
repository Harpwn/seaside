interface SeasidePlayer extends Player {
}

interface SeasideGamedatas extends Gamedatas<SeasidePlayer> {
    roll: number,
    board: { col: number, row: number, player: string, dice_value: number}[]
}

declare enum SeasideGameStates {
    PlayToken = "playToken",
    StealCrab = "stealCrab",
    FlipBeach = "flipBeach",
    SelectIsopods = "selectIsopods",
    NextPlayer = "nextPlayer",
    GameEnd = "gameEnd"
}