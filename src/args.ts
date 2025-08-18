import { SeasideGameStates } from "./enums";

export interface SeasidePlayTokenArgs {
    token: SeasideToken;
}

export interface SeasideNextPlayerArgs {
    
}

export interface SeasideFlipBeachArgs {
    flippableBeachIds: number[];
}

export interface SeasideStealCrabArgs {
    playersWithCrabsIds: number[];
}

export interface SeasideSelectIsopodsArgs {
    selectableIsopodIds: number[];
}