declare interface SeasidePlayer extends Player {
    tokens: Record<number, SeasideToken>;
}

declare interface SeasideGamedatas extends Gamedatas<SeasidePlayer> {
    seaTokens: Record<number, SeasideToken>;
}

declare interface TokenPlayedNotificationData {
    playerId: number;
    tokenId: number;
    tokenSide: SeasideTokenType;
    tokenLocation: string;
    tokenLocationArgs: number;
}

declare interface TokenToSeaNotificationData {
    tokenId: number;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

declare interface TokenToPlayerAreaNotificationData {
    playerId: number;
    tokenId: number;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

declare interface TokenMovesWithinPlayerAreaNotificationData {
    playerId: number;
    tokenId: number;
    tokenSide: SeasideTokenType;
    fromLocationArgs: number;
    toLocationArgs: number;
}

declare interface CrabStolenNotificationData {
    thiefId: number;
    playerId: number;
    tokenId: number;
}

declare interface RockGetsCrabsNotificationData {
    playerId: number;
    crabCount: number;
    tokenIds: number[];
}

declare interface BeachGetsShellsNotificationData {
    playerId: number;
    shellCount: number;
    tokenIds: number[];
}

declare interface SandpiperGetsIsopodsNotificationData {
    playerId: number;
    isopodCount: number;
    tokenIds: number[];
    newSandpiperPileId: number;
}

declare interface SandpiperIsopodsLostNotificationData {
    playerId: number;
    isopodCount: number;
    tokenIds: number[];
    sandpiperId: number;
}

declare interface BeachFlipNotificationData {
    playerId: number;
    tokenId: number;
    otherSideType: SeasideTokenType;
}

declare interface EndGameWaveBonusTieNotificationData {
  playerIdsAndTokenIds: Record<number, number[]>;
  playerNames: string[];
}

declare interface EndGameWaveBonusNotificationData {
    playerId: number;
    tokenCount: number;
    tokenIds: number[];
}

declare interface PlayTokenActionData {
  tokenId: number;
  tokenType: SeasideTokenType;
}

declare interface FlipBeachActionData {
  beachId: number;
}

declare interface StealCrabActionData {
  victimId: number;
}

declare interface SelectIsopodsActionData {
  isopodIds: string;
}

declare interface SeasidePlayTokenArgs {
  token: SeasideToken;
  currentPileSizes: number[];
  selectableIsopodIds: number[];
}

declare interface SeasideNextPlayerArgs {}

declare interface SeasideFlipBeachArgs {
  flippableBeachIds: number[];
}

declare interface SeasidePlayAgainArgs {}

declare interface SeasideStealCrabArgs {
  playersWithCrabsIds: number[];
}

declare interface SeasideSelectIsopodsArgs {
  selectableIsopodIds: number[];
  sandpiperId: number;
  currentPileSizes: number[];
}

type SeasideTokenType = 'CRAB' | 'ISOPOD' | 'BEACH' | 'SHELL' | 'SANDPIPER' | 'WAVE' | 'ROCK';
