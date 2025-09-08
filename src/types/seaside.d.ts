declare interface SeasideToken {
  id: number;
  side1: SeasideTokenType;
  side2: SeasideTokenType;
  activeType: SeasideTokenType;
  inactiveType: SeasideTokenType;
  location: string;
  locationArg: number;
  flipped: boolean;
}

declare interface SeasidePlayer extends Player {
    tokens: Record<number, SeasideToken>;
}

declare interface SeasideGamedatas extends Gamedatas<SeasidePlayer> {
    seaTokens: Record<number, SeasideToken>;
}

declare interface TokenPlayedNotificationData {
    playerId: number;
    token: SeasideToken;
    tokenSide: SeasideTokenType;
}

declare interface TokenToSeaNotificationData {
    token: SeasideToken;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

declare interface TokenToPlayerAreaNotificationData {
    playerId: number;
    token: SeasideToken;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

declare interface TokenMovesWithinPlayerAreaNotificationData {
    playerId: number;
    token: SeasideToken;
    tokenSide: SeasideTokenType;
    fromLocationArgs: number;
    toLocationArgs: number;
}

declare interface CrabStolenNotificationData {
    thiefId: number;
    playerId: number;
    token: SeasideToken;
}

declare interface RockGetsCrabsNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

declare interface BeachGetsShellsNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

declare interface CreateSandpiperPileNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

declare interface SandpiperIsopodsLostNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

declare interface BeachFlipNotificationData {
    playerId: number;
    token: SeasideToken;
}

declare interface EndGameWaveBonusTieNotificationData {
  playerIdsAndTokens: Record<number, SeasideToken[]>;
  playerNames: string[];
}

declare interface EndGameWaveBonusNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
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
  selectableIsopods: SeasideToken[];
}

declare interface SeasideNextPlayerArgs {}

declare interface SeasideFlipBeachArgs {
  flippableBeachs: SeasideToken[];
}

declare interface SeasidePlayAgainArgs {}

declare interface SeasideStealCrabArgs {
  playersWithCrabs: { id: number; name: string }[];
}

declare interface SeasideSelectIsopodsArgs {
  selectableIsopods: SeasideToken[];
  sandpiper: SeasideToken;
  currentPileSizes: number[];
}

type SeasideTokenType = 'CRAB' | 'ISOPOD' | 'BEACH' | 'SHELL' | 'SANDPIPER' | 'WAVE' | 'ROCK';