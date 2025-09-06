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
      args.flippableBeachIds.forEach((beachId) => {
        const beachEl = this.game.tokens.getTokenElById(beachId);
        beachEl.classList.add("possible-move");
        beachEl.addEventListener("click", () => {
          this.game.tokens.selectSingleToken(beachId);
        });
      });
    }
  }

  leaveStateFlipBeach() {}

  enteringStealCrabState(args: SeasideStealCrabArgs) {
    if (this.game.isCurrentPlayerActive()) {
      args.playersWithCrabsIds.forEach((playerId) => {
        const playerPanel = document.getElementById(
          `seaside-player-${playerId}`
        );
        playerPanel.classList.add("possible-move");
        playerPanel.addEventListener("click", () => {
          this.game.selectSinglePlayer(playerId);
        });
      });
    }
  }

  leaveStateStealCrab() {}

  
  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    if (this.game.isCurrentPlayerActive()) {
      args.selectableIsopodIds.forEach((isopodId) => {
        const isopodEl = this.game.tokens.getTokenElById(isopodId);
        isopodEl.classList.add("possible-move");
        isopodEl.addEventListener("click", () =>
          this.game.tokens.selectMultipleToken(isopodId)
        );
      });
    }
  }

  leaveStateSelectIsopods() {}
}
