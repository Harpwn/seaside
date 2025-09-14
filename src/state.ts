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

  leaveStatePlayToken() {}

  enteringPlayAgainState(args: SeasidePlayAgainArgs) {
    //Play some kind of animation
  }

  enteringGameEndState() {
    document.getElementById("seaside-endgame-scoring").style.display = "block";
  }

  leaveStatePlayAgain() {}

  enteringNextPlayerState(args: SeasideNextPlayerArgs) {}

  leaveStateNextPlayer() {}

  enteringFlipBeachState(args: SeasideFlipBeachArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.tokens.setSelectableBeaches(this.game.player_id.toString(), args.flippableBeachs);
    }
  }

  leaveStateFlipBeach() {}

  enteringStealCrabState(args: SeasideStealCrabArgs) {
  }

  leaveStateStealCrab() {}
  
  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    this.tokens.drawToken(args.sandpiper);
    if (this.game.isCurrentPlayerActive()) {
      this.tokens.setSelectableIsopods(args.selectableIsopods);
    }
  }

  leaveStateSelectIsopods() {}
}
