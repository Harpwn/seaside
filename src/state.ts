enum SeasideGameStates {
  PlayToken = "playToken",
  PlayAgain = "playAgain",
  StealCrab = "stealCrab",
  FlipBeach = "flipBeach",
  SelectIsopods = "selectIsopods",
  NextPlayer = "nextPlayer",
  PreEndGame = "preEndGame",
  EndGameScoring = "endGameScoring",
  GameEnd = "gameEnd",
}

class SeasideStateManager {

  constructor(private game: SeasideGame, private tokens: TokenManager) {
    this.game = game;
  }

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    this.tokens.drawToken(args.token);
    this.game.setDrawBagGuage(args.gameProgression);
  }

  enteringFlipBeachState(args: SeasideFlipBeachArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.tokens.setSelectableBeaches(this.game.player_id.toString(), args.flippableBeachs);
    }
  }

  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    this.tokens.drawToken(args.sandpiper);
    if (this.game.isCurrentPlayerActive()) {
      this.tokens.setSelectableIsopods(args.selectableIsopods);
    }
  }
}
