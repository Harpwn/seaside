export interface PlayTokenActionData {
    token_id: number;
    token_type: SeasideTokenType;
}

export interface NextPlayerActionData {
}

export interface FlipBeachActionData {
    beach_id: number;
}

export interface StealCrabActionData {
    victim_id: number[];
}

export interface SelectIsopodsActionData {
    isopod_ids: number[];
}