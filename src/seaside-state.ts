import { SeasideGame } from "src";

export class SeasideStateManager {
  private game: SeasideGame;

  constructor(game: SeasideGame) {
    this.game = game;
  }

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    this.game.drawToken(args.token);
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
        const beachEl = this.game.getTokenElById(beachId);
        beachEl.classList.add("possible-move");
        beachEl.addEventListener("click", () => {
          this.game.selectSingleToken(beachId);
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
        const isopodEl = this.game.getTokenElById(isopodId);
        isopodEl.classList.add("possible-move");
        isopodEl.addEventListener("click", () =>
          this.game.selectMultipleToken(isopodId)
        );
      });
    }
  }

  leaveStateSelectIsopods() {}
}
