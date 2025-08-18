export enum SeasideGameStates {
    PlayToken = "playToken",
    StealCrab = "stealCrab",
    FlipBeach = "flipBeach",
    SelectIsopods = "selectIsopods",
    NextPlayer = "nextPlayer",
    GameEnd = "gameEnd"
}

export enum SeassideGameActions {
    PlayToken = "actPlayToken",
    NextPlayer = "actNextPlayer",
    FlipBeach = "actFlipBeach",
    StealCrab = "actStealCrab",
    SelectIsopods = "actSelectIsopods"
}

export enum SeasideNotifications {
    TokenPlayed = "tokenPlayed",
    TokenToSea = "tokenToSea",
    TokenToPlayerArea = "tokenToPlayerArea",
    TokensToPlayerArea = "tokensToPlayerArea",
    TokenToDiscard = "tokenToDiscard"
}