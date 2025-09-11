import { SeasideGameGui } from "./seaside-gui";

export enum SeasideGameStates {
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

export class SeasideStateManager {

  constructor(private game: SeasideGameGui) {
    this.game = game;
  }

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    this.game.tokens.drawToken(args.token);
  }

  leaveStatePlayToken() {}

  enteringPlayAgainState(args: SeasidePlayAgainArgs) {
    //Play some kind of animation
  }

  leaveStatePlayAgain() {}

  enteringNextPlayerState(args: SeasideNextPlayerArgs) {}

  leaveStateNextPlayer() {}

  enteringFlipBeachState(args: SeasideFlipBeachArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.tokens.setSelectableBeaches(this.game.player_id.toString(), args.flippableBeachs);
    }
  }

  leaveStateFlipBeach() {}

  enteringStealCrabState(args: SeasideStealCrabArgs) {
  }

  leaveStateStealCrab() {}
  
  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    this.game.tokens.drawToken(args.sandpiper);
    if (this.game.isCurrentPlayerActive()) {
      this.game.tokens.setSelectableIsopods(args.selectableIsopods);
    }
  }

  leaveStateSelectIsopods() {}
}
