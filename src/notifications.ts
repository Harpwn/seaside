interface TokenPlayedNotificationData {
    player_id: number;
    token_id: number;
    token_side: SeasideTokenType;
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
    token_side: SeasideTokenType;
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
  }
}
