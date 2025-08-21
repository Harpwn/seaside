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

interface TokensToPlayerAreaNotificationData {
    playerId: number;
    tokenIds: number[];
    tokenLocationArgs: number;
}

interface TokensToDiscardNotificationData {
    tokenIds: number[];
    playerId: number;
    tokenCount: number;
}

enum SeasideGameNotifications {
    TokenPlayed = "tokenPlayed",
    TokenToSea = "tokenToSea",
    TokenToPlayerArea = "tokenToPlayerArea",
    TokensToPlayerArea = "tokensToPlayerArea",
    TokenToDiscard = "tokenToDiscard"
}

export class SeasideNotifications extends GameGui<SeasideGamedatas> {

  async notif_tokenPlayed(args: TokenPlayedNotificationData) {
    console.log("Token played", args);
    const tokenEl = getTokenElById(args.tokenId);
    //flip is needed
    if (tokenEl.getAttribute("data-active-type") !== args.tokenSide) {
      flipToken(tokenEl);
    }
  }

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    console.log("Token moved to sea", args);
    await moveTokenToSea(args.tokenId, args.tokenLocationArgs, this);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    console.log("Token moved to player area", args);
    await moveTokenToPlayerArea(args.playerId.toString(), args.tokenId, args.tokenLocationArgs, this);
  }

  async notif_tokensToPlayerArea(args: TokensToPlayerAreaNotificationData) {
    console.log("Tokens moved to player area", args);
    for (const tokenId of args.tokenIds) {
      await moveTokenToPlayerArea(args.playerId.toString(), tokenId, args.tokenLocationArgs, this);
    }
  }

  async notif_tokensToDiscard(args: TokensToDiscardNotificationData) {
    console.log("Tokens discarded", args);
    for (const tokenId of args.tokenIds) {
      await moveTokenToDiscard(tokenId, this);
    }
  }
}
