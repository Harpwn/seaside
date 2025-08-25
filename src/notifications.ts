import { flipToken, getTokenElById, moveTokenToDiscard, moveTokenToPlayerArea, moveTokenToSea } from "./utils";

interface TokenPlayedNotificationData {
    playerId: number;
    tokenId: number;
    tokenSide: SeasideTokenType;
    tokenLocation: string;
    tokenLocationArgs: number;
}

interface TokenToSeaNotificationData {
    tokenId: number;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

interface TokenToPlayerAreaNotificationData {
    playerId: number;
    tokenId: number;
    tokenSide: SeasideTokenType;
    tokenLocationArgs: number;
}

interface TokenMovesWithinPlayerAreaNotificationData {
    playerId: number;
    tokenId: number;
    tokenSide: SeasideTokenType;
    fromLocationArgs: number;
    toLocationArgs: number;
}

interface CrabStolenNotificationData {
    thiefId: number;
    playerId: number;
    tokenId: number;
}

interface RockGetsCrabsNotificationData {
    playerId: number;
    crabCount: number;
    tokenIds: number[];
}

interface BeachGetsShellsNotificationData {
    playerId: number;
    shellCount: number;
    tokenIds: number[];
}

interface SandpiperGetsIsopodsNotificationData {
    playerId: number;
    isopodCount: number;
    tokenIds: number[];
    newSandpiperPileId: number;
}

interface SandpiperIsopodsLostNotificationData {
    playerId: number;
    isopodCount: number;
    tokenIds: number[];
    sandpiperId: number;
}

interface BeachFlipNotificationData {
    playerId: number;
    tokenId: number;
    otherSideType: SeasideTokenType;
}

interface EndGameWaveBonusTieNotificationData {
  playerIdsAndTokenIds: Record<number, number[]>;
  playerNames: string[];
}

interface EndGameWaveBonusNotificationData {
    playerId: number;
    tokenCount: number;
    tokenIds: number[];
}

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

export class SeasideNotifications extends GameGui<SeasideGamedatas> {

  async notif_tokenPlayed(args: TokenPlayedNotificationData) {
    const tokenEl = getTokenElById(args.tokenId);
    //flip is needed
    if (tokenEl.getAttribute("data-active-type") !== args.tokenSide) {
      flipToken(tokenEl);
    }
  }

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    await moveTokenToSea(args.tokenId, args.tokenLocationArgs, this);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    await moveTokenToPlayerArea(args.playerId.toString(), args.tokenId, args.tokenLocationArgs, this);
    this.scoreCtrl[args.playerId].incValue(1);
  }

  async notif_tokenMovesWithinPlayerArea(args: TokenMovesWithinPlayerAreaNotificationData) {
    await moveTokenToPlayerArea(args.playerId.toString(), args.tokenId, args.toLocationArgs, this);
  }

  async notif_crabStolen(args: CrabStolenNotificationData) {
    await moveTokenToPlayerArea(args.thiefId.toString(), args.tokenId, 0, this);
    this.scoreCtrl[args.playerId].incValue(-1);
    this.scoreCtrl[args.thiefId].incValue(1);
  }

  async notif_rockGetsCrabs(args: RockGetsCrabsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await moveTokenToPlayerArea(args.playerId.toString(), tokenId, 0, this);
    }
    this.scoreCtrl[args.playerId].incValue(args.crabCount);
  }

  async notif_beachGetsShells(args: BeachGetsShellsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await moveTokenToPlayerArea(args.playerId.toString(), tokenId, 0, this);
    }
    this.scoreCtrl[args.playerId].incValue(args.shellCount);
  }

  async notif_sandpiperGetsIsopods(args: SandpiperGetsIsopodsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await moveTokenToPlayerArea(args.playerId.toString(), tokenId, args.newSandpiperPileId, this);
    }
    this.scoreCtrl[args.playerId].incValue(args.isopodCount);
  }

  async notif_sandpiperIsopodsLost(args: SandpiperIsopodsLostNotificationData) {
    await moveTokenToDiscard(args.sandpiperId, this);
    this.scoreCtrl[args.playerId].incValue(-1);
    for (const tokenId of args.tokenIds) {
      await moveTokenToDiscard(tokenId, this);
    }
    this.scoreCtrl[args.playerId].incValue(-args.isopodCount);
  }

  async notif_beachFlip(args: BeachFlipNotificationData) {
    await flipToken(getTokenElById(args.tokenId));
  }

  async notif_endGameWaveBonusTie(args: EndGameWaveBonusTieNotificationData) {
    Object.keys(args.playerIdsAndTokenIds).forEach(playerId => {
      const tokenIds = args.playerIdsAndTokenIds[playerId];
      tokenIds.forEach(async seaTokenId => {
        await moveTokenToPlayerArea(playerId, seaTokenId, 0, this);
      });
      this.scoreCtrl[playerId].incValue(tokenIds.length);
    });
  }

  async notif_endGameWaveBonus(args: EndGameWaveBonusNotificationData) {
    args.tokenIds.forEach(async seaTokenId => {
        await moveTokenToPlayerArea(args.playerId.toString(), seaTokenId, 0, this);
      });
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }
}