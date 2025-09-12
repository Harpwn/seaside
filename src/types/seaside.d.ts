interface SeasideToken {
  id: number;
  side1: SeasideTokenType;
  side2: SeasideTokenType;
  activeType: SeasideTokenType;
  inactiveType: SeasideTokenType;
  location: string;
  locationArg: number;
  flipped: boolean;
}

interface SeasidePlayer extends Player {
    tokens: Record<number, SeasideToken>;
}

interface SeasideGamedatas extends Gamedatas<SeasidePlayer> {
    seaTokens: Record<number, SeasideToken>;
}

interface TokenPlayedNotificationData {
    playerId: number;
    token: SeasideToken;
    tokenSide: SeasideTokenType;
}

interface TokenToSeaNotificationData {
    token: SeasideToken;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

interface TokenToPlayerAreaNotificationData {
    playerId: number;
    token: SeasideToken;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

interface TokenMovesWithinPlayerAreaNotificationData {
    playerId: number;
    token: SeasideToken;
    tokenSide: SeasideTokenType;
    fromLocationArgs: number;
    toLocationArgs: number;
}

interface CrabStolenNotificationData {
    thiefId: number;
    playerId: number;
    token: SeasideToken;
}

interface RockGetsCrabsNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

interface BeachGetsShellsNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

interface CreateSandpiperPileNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

interface SandpiperIsopodsLostNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

interface BeachFlipNotificationData {
    playerId: number;
    token: SeasideToken;
}

interface EndGameWaveBonusTieNotificationData {
  playerIdsAndTokens: Record<number, SeasideToken[]>;
  playerNames: string[];
}

interface EndGameWaveBonusNotificationData {
    playerId: number;
    tokenCount: number;
    tokens: SeasideToken[];
}

interface PlayTokenActionData {
  tokenId: number;
  tokenType: SeasideTokenType;
}

interface FlipBeachActionData {
  beachId: number;
}

interface StealCrabActionData {
  victimId: number;
}

interface SelectIsopodsActionData {
  isopodIds: string;
}

interface SeasidePlayTokenArgs {
  token: SeasideToken;
  currentPileSizes: number[];
  selectableIsopods: SeasideToken[];
  gameProgression: number;
}

interface SeasideNextPlayerArgs {}

interface SeasideFlipBeachArgs {
  flippableBeachs: SeasideToken[];
}

interface SeasidePlayAgainArgs {}

interface SeasideStealCrabArgs {
  playersWithCrabs: { id: number; name: string }[];
}

interface SeasideSelectIsopodsArgs {
  selectableIsopods: SeasideToken[];
  sandpiper: SeasideToken;
  currentPileSizes: number[];
}

type SeasideTokenType = 'CRAB' | 'ISOPOD' | 'BEACH' | 'SHELL' | 'SANDPIPER' | 'WAVE' | 'ROCK';

interface SeasideGame extends GameGui<SeasideGamedatas> {
  animationManager: AnimationManager;
  tokens: TokenManager;
  states: SeasideStateManager;
  actions: SeasideActions;
  zoom: ZoomManager;

  setTooltip(id: string, html: string): void;
  onUpdateActionButtons(stateName: string, args: any): void;
  updateConfirmDisabled(disabled: boolean): void;
  setupNotifications(): void;
  setDrawBagGuage(percentage: number): void;
}