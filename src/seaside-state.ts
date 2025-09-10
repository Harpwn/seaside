import { SeasideGameGui } from "./seaside-gui";

export enum SeasideGameStates {
  PlayToken = "playToken",
  PlayAgain = "playAgain",
  StealCrab = "stealCrab",
  FlipBeach = "flipBeach",
  SelectIsopods = "selectIsopods",
  NextPlayer = "nextPlayer",
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
      args.flippableBeachs.forEach((beach) => {
        const beachEl = this.game.tokens.getCardElement(beach);
        beachEl.classList.add(this.game.tokens.getSelectableCardClass());
        beachEl.addEventListener("click", () => {
          this.game.tokens.selectSingleToken(beach);
        });
      });
    }
  }

  leaveStateFlipBeach() {}

  enteringStealCrabState(args: SeasideStealCrabArgs) {
  }

  leaveStateStealCrab() {}
  
  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    this.game.tokens.drawToken(args.sandpiper);
    if (this.game.isCurrentPlayerActive()) {
      args.selectableIsopods.forEach((isopod) => {
        const isopodEl = this.game.tokens.getCardElement(isopod);
        isopodEl.classList.add(this.game.tokens.getSelectableCardClass());
        isopodEl.addEventListener("click", () =>
          this.game.tokens.selectMultipleToken(isopod)
        );
      });
    }
  }

  leaveStateSelectIsopods() {}
}
