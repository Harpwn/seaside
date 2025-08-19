declare interface SeasidePlayer extends Player {
    tokens: Record<number, SeasideToken>;
}

declare interface SeasideGamedatas extends Gamedatas<SeasidePlayer> {
    seaTokens: Record<number, SeasideToken>;
}

declare interface SeasideToken {
    id: number,
    type
}