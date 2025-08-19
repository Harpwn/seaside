import { flipToken, getTokenElById, moveTokenToPlayerArea, moveTokenToSea } from "./utils";

interface TokenPlayedNotificationData {
    player_id: number;
    token_id: number;
    token_side: SeasideTokenType;
    token_location: string;
    pile_id: number;
}

interface TokenToSeaNotificationData {
    token_id: number;
    token_side: SeasideTokenType;
}

interface TokenToPlayerAreaNotificationData {
    player_id: number;
    token_id: number;
    token_side: SeasideTokenType;
    pile_id: number;
}

interface TokensToPlayerAreaNotificationData {
    player_id: number;
    token_ids: number[];
    pile_id: number;
}

interface TokensToDiscardNotificationData {
    token_ids: number[];
    player_id: number;
    token_count: number;
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
    const tokenEl = getTokenElById(args.token_id);
    //flip is needed
    if (tokenEl.getAttribute("data-active-type") !== args.token_side) {
      flipToken(tokenEl);
    }
  }

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    console.log("Token moved to sea", args);
    const tokenEl = getTokenElById(args.token_id);
    await moveTokenToSea(tokenEl, this);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    console.log("Token moved to player area", args);
    const tokenEl = getTokenElById(args.token_id);
    await moveTokenToPlayerArea(args.player_id.toString(), tokenEl, this);
  }

  async notif_tokensToPlayerArea(args: TokensToPlayerAreaNotificationData) {
    console.log("Tokens moved to player area", args);
    for (const tokenId of args.token_ids) {
      const tokenEl = getTokenElById(tokenId);
      await moveTokenToPlayerArea(args.player_id.toString(), tokenEl, this);
    }
  }
}
