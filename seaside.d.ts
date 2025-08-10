interface SeasidePlayer extends Player {
}

interface SeasideGamedatas extends Gamedatas<SeasidePlayer> {
    roll: number,
    board: { col: number, row: number, player: string, dice_value: number}[]
}
