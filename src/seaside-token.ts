
class SeasideToken {
    constructor($token) {
        this.id = $token.id;
        this.activeType = $token.activeType;
        this.inactiveType = $token.inactiveType;
        this.location = $token.location;
        this.locationArg = $token.locationArg;
    }

    public id: number;
    public activeType: SeasideTokenType;
    public inactiveType: SeasideTokenType;
    public location: string;
    public locationArg: string;
}