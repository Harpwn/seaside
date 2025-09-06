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
    
  async notif_tokenPlayed(args: TokenPlayedNotificationData) {
    const tokenEl = this.tokens.getTokenElById(args.tokenId);
    //flip is needed
    if (tokenEl.getAttribute("data-active-type") !== args.tokenSide) {
      this.tokens.flipToken(tokenEl);
    }
  }

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    await this.tokens.moveTokenToSea(args.tokenId, args.tokenLocationArgs);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    await this.tokens.moveTokenToPlayerArea(
      args.playerId.toString(),
      args.tokenId,
      args.tokenLocationArgs
    );
    this.scoreCtrl[args.playerId].incValue(1);
  }

  async notif_tokenMovesWithinPlayerArea(
    args: TokenMovesWithinPlayerAreaNotificationData
  ) {
    await this.tokens.moveTokenToPlayerArea(
      args.playerId.toString(),
      args.tokenId,
      args.toLocationArgs
    );
  }

  async notif_crabStolen(args: CrabStolenNotificationData) {
    await this.tokens.moveTokenToPlayerArea(args.thiefId.toString(), args.tokenId, 0);
    this.scoreCtrl[args.playerId].incValue(-1);
    this.scoreCtrl[args.thiefId].incValue(1);
  }

  async notif_rockGetsCrabs(args: RockGetsCrabsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await this.tokens.moveTokenToPlayerArea(args.playerId.toString(), tokenId, 0);
    }
    this.scoreCtrl[args.playerId].incValue(args.crabCount);
  }

  async notif_beachGetsShells(args: BeachGetsShellsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await this.tokens.moveTokenToPlayerArea(args.playerId.toString(), tokenId, 0);
    }
    this.scoreCtrl[args.playerId].incValue(args.shellCount);
  }

  async notif_sandpiperGetsIsopods(args: SandpiperGetsIsopodsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await this.tokens.moveTokenToPlayerArea(
        args.playerId.toString(),
        tokenId,
        args.newSandpiperPileId
      );
    }
    this.scoreCtrl[args.playerId].incValue(args.isopodCount);
  }

  async notif_sandpiperIsopodsLost(args: SandpiperIsopodsLostNotificationData) {
    await this.tokens.moveTokenToDiscard(args.sandpiperId);
    this.scoreCtrl[args.playerId].incValue(-1);
    for (const tokenId of args.tokenIds) {
      await this.tokens.moveTokenToDiscard(tokenId);
    }
    this.scoreCtrl[args.playerId].incValue(-args.isopodCount);
  }

  async notif_beachFlip(args: BeachFlipNotificationData) {
    //await this.tokens.flipToken(this.getTokenElById(args.tokenId));
  }

  async notif_endGameWaveBonusTie(args: EndGameWaveBonusTieNotificationData) {
    Object.keys(args.playerIdsAndTokenIds).forEach((playerId) => {
      const tokenIds = args.playerIdsAndTokenIds[playerId];
      tokenIds.forEach(async (seaTokenId) => {
        await this.tokens.moveTokenToPlayerArea(playerId, seaTokenId, 0);
      });
      this.scoreCtrl[playerId].incValue(tokenIds.length);
    });
  }

  async notif_endGameWaveBonus(args: EndGameWaveBonusNotificationData) {
    args.tokenIds.forEach(async (seaTokenId) => {
      await this.tokens.moveTokenToPlayerArea(args.playerId.toString(), seaTokenId, 0);
    });
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }
}