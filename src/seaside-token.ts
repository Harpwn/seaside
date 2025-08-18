type SeasideTokenType = 'CRAB' | 'ISOPOD' | 'BEACH' | 'SHELL' | 'SANDPIPER' | 'WAVE' | 'ROCK';

class SeasideToken {
    constructor($token) {
        this.id = $token.id;
        this.activeSide = $token.activeSide;
        this.inactiveSide = $token.inactiveSide;
        this.location = $token.location;
        this.locationArg = $token.locationArg;
    }

    public id: number;
    public activeSide: SeasideTokenType;
    public inactiveSide: SeasideTokenType;
    public location: string;
    public locationArg: string;
}