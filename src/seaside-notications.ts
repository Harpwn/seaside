import { SeasideGameGui } from "./seaside-gui";

enum SeasideGameNotifications {
  TokenPlayed = "tokenPlayed",
  TokenToSea = "tokenToSea",
  TokenToPlayerArea = "tokenToPlayerArea",
  TokenMovesWithinPlayerArea = "tokenMovesWithinPlayerArea",
  CrabStolen = "crabStolen",
  RockGetsCrabs = "rockGetsCrabs",
  BeachFlip = "beachFlip",
  BeachGetsShells = "beachGetsShells",
  SandpiperGetsIsopods = "sandpiperGetsIsopods",
  SandpiperIsopodsLost = "sandpiperIsopodsLost",
  EndGameWaveBonus = "endGameWaveBonus",
  EndGameWaveBonusTie = "endGameWaveBonusTie",
}

export class SeasideNotifications extends SeasideGameGui {
  async notif_tokenPlayed(args: TokenPlayedNotificationData) {}

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    await this.tokens.moveTokenToSea(args.token);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    await this.tokens.moveTokenToPlayerArea(
      args.token,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(1);
  }

  async notif_tokenMovesWithinPlayerArea(
    args: TokenMovesWithinPlayerAreaNotificationData
  ) {
    await this.tokens.moveTokenToPlayerArea(
      args.token,
      args.playerId.toString()
    );
  }

  async notif_crabStolen(args: CrabStolenNotificationData) {
    await this.tokens.moveTokenToPlayerArea(
      args.token,
      args.thiefId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(-1);
    this.scoreCtrl[args.thiefId].incValue(1);
  }

  async notif_rockGetsCrabs(args: RockGetsCrabsNotificationData) {
    for (const token of args.tokens) {
      await this.tokens.moveTokenToPlayerArea(token, args.playerId.toString());
    }
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  async notif_beachGetsShells(args: BeachGetsShellsNotificationData) {
    for (const token of args.tokens) {
      await this.tokens.moveTokenToPlayerArea(token, args.playerId.toString());
    }
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  async notif_createSandpiperPile(args: CreateSandpiperPileNotificationData) {
    await this.tokens.createSandpiperPile(
      args.tokens,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  async notif_sandpiperIsopodsLost(args: SandpiperIsopodsLostNotificationData) {
    await this.tokens.discardSandpiperPile(
      args.tokens,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(-args.tokenCount);
  }

  async notif_beachFlip(args: BeachFlipNotificationData) {}

  async notif_endGameWaveBonusTie(args: EndGameWaveBonusTieNotificationData) {
    for (const playerId of Object.keys(args.playerIdsAndTokens)) {
      const tokens = args.playerIdsAndTokens[playerId];
      await this.tokens.moveEndGameBonusTokens(tokens, playerId);
      this.scoreCtrl[playerId].incValue(tokens.length);
    }
  }

  async notif_endGameWaveBonus(args: EndGameWaveBonusNotificationData) {
    await this.tokens.moveEndGameBonusTokens(args.tokens, args.playerId.toString());
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }
}
