export interface TokenPlayedNotificationData {
    player_id: number;
    token_id: number;
    token_side: SeasideTokenType;
}

export interface TokenToSeaNotificationData {
    token_id: number;
    token_side: SeasideTokenType;
}

export interface TokenToPlayerAreaNotificationData {
    player_id: number;
    token_id: number;
    token_side: SeasideTokenType;
    pile_id: number;
}

export interface TokensToPlayerAreaNotificationData {
    player_id: number;
    token_ids: number[];
    token_side: SeasideTokenType;
    pile_id: number;
}

export interface TokensToDiscardNotificationData {
    token_ids: number[];
    player_id: number;
    token_count: number;
}