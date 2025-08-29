import {
  clearMoves,
  drawToken,
  flipToken,
  getTokenElById,
  selectSinglePlayer,
  selectMultipleToken,
  selectSingleToken,
} from "./utils";

enum SeasideGameActions {
  PlayToken = "actPlayToken",
  NextPlayer = "actNextPlayer",
  FlipBeach = "actFlipBeach",
  StealCrab = "actStealCrab",
  SelectIsopods = "actSelectIsopods",
}

enum SeasideGameStates {
  PlayToken = "playToken",
  PlayAgain = "playAgain",
  StealCrab = "stealCrab",
  FlipBeach = "flipBeach",
  SelectIsopods = "selectIsopods",
  NextPlayer = "nextPlayer",
  GameEnd = "gameEnd",
}

interface PlayTokenActionData {
  tokenId: number;
  tokenType: SeasideTokenType;
}

interface FlipBeachActionData {
  beachId: number;
}

interface StealCrabActionData {
  victimId: number;
}

interface SelectIsopodsActionData {
  isopodIds: string;
}

interface SeasidePlayTokenArgs {
  token: SeasideToken;
}

interface SeasideNextPlayerArgs {}

interface SeasideFlipBeachArgs {
  flippableBeachIds: number[];
}

interface SeasidePlayAgainArgs {}

interface SeasideStealCrabArgs {
  playersWithCrabsIds: number[];
}

interface SeasideSelectIsopodsArgs {
  selectableIsopodIds: number[];
  sandpiperId: number;
  currentPileSizes: number[];
}

export class SeasideActions extends GameGui<SeasideGamedatas> {
  onEnteringState(stateName: string, payload: any) {
    console.log("Entering state: " + stateName, payload);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.enteringPlayTokenState(payload.args);
        break;
      case SeasideGameStates.PlayAgain:
        this.enteringPlayAgainState(payload.args);
        break;
      case SeasideGameStates.NextPlayer:
        this.enteringNextPlayerState(payload.args);
        break;
      case SeasideGameStates.FlipBeach:
        this.enteringFlipBeachState(payload.args);
        break;
      case SeasideGameStates.StealCrab:
        this.enteringStealCrabState(payload.args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.enteringSelectIsopodsState(payload.args);
        break;
    }
  }

  onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.leaveStatePlayToken();
        break;
      case SeasideGameStates.PlayAgain:
        this.leaveStatePlayAgain();
        break;
      case SeasideGameStates.NextPlayer:
        this.leaveStateNextPlayer();
        break;
      case SeasideGameStates.FlipBeach:
        this.leaveStateFlipBeach();
        break;
      case SeasideGameStates.StealCrab:
        this.leaveStateStealCrab();
        break;
      case SeasideGameStates.SelectIsopods:
        this.leaveStateSelectIsopods();
        break;
    }

    clearMoves();
  }

  onUpdateActionButtons(stateName: string, args: any) {
    console.log("Update Action Buttons: " + stateName, args);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.updateActionButtonsPlayToken(args);
        break;
      case SeasideGameStates.PlayAgain:
        this.updateActionButtonsPlayAgain(args);
        break;
      case SeasideGameStates.NextPlayer:
        this.updateActionButtonsNextPlayer(args);
        break;
      case SeasideGameStates.FlipBeach:
        this.updateActionButtonsFlipBeach(args);
        break;
      case SeasideGameStates.StealCrab:
        this.updateActionButtonsStealCrab(args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.updateActionButtonsSelectIsopods(args);
        break;
    }
  }

  //playToken

  actPlayToken(token: SeasideToken, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      tokenId: token.id,
      tokenType: tokenType,
    };

    const tokenEl = getTokenElById(token.id);

    if (token.activeType !== tokenType) {
      flipToken(tokenEl);
    }

    this.bgaPerformAction(SeasideGameActions.PlayToken, data);
  }

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    drawToken(args.token);
  }

  leaveStatePlayToken() {}

  updateActionButtonsPlayToken(args: SeasidePlayTokenArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(`Play ${args.token.activeType} Side`, () =>
        this.actPlayToken(args.token, args.token.activeType)
      );
      this.statusBar.addActionButton(
        `Play ${args.token.inactiveType} Side`,
        () => this.actPlayToken(args.token, args.token.inactiveType)
      );
    }
  }

  //playAgain

  enteringPlayAgainState(args: SeasidePlayAgainArgs) {
    //Play some kind of animation
  }

  leaveStatePlayAgain() {}

  updateActionButtonsPlayAgain(args: SeasidePlayAgainArgs) {}

  //nextPlayer

  enteringNextPlayerState(args: SeasideNextPlayerArgs) {}

  leaveStateNextPlayer() {}

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  //flipBeach

  actFlipBeach(tokenId: number) {
    const data: FlipBeachActionData = {
      beachId: tokenId,
    };

    this.bgaPerformAction(SeasideGameActions.FlipBeach, data);
  }

  enteringFlipBeachState(args: SeasideFlipBeachArgs) {
    if (this.isCurrentPlayerActive()) {
      args.flippableBeachIds.forEach((beachId) => {
        const beachEl = getTokenElById(beachId);
        beachEl.classList.add("possible-move");
        beachEl.addEventListener("click", () => {
          selectSingleToken(beachId);
        });
      });
    }
  }

  leaveStateFlipBeach() {}

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(
        `Confirm`,
        () => {
          const beachId = document
            .querySelector(".selected-move")
            .getAttribute("data-id");
          this.actFlipBeach(parseInt(beachId));
        },
        {
          id: `seaside-confirm`,
          disabled: true,
        }
      );
    }
  }

  //stealCrab

  actStealCrab(victimId: number) {
    const data: StealCrabActionData = {
      victimId,
    };

    this.bgaPerformAction(SeasideGameActions.StealCrab, data);
  }

  enteringStealCrabState(args: SeasideStealCrabArgs) {
    if (this.isCurrentPlayerActive()) {
      args.playersWithCrabsIds.forEach((playerId) => {
        const playerPanel = document.getElementById(
          `seaside-player-${playerId}`
        );
        playerPanel.classList.add("possible-move");
        playerPanel.addEventListener("click", () => {
          selectSinglePlayer(playerId);
        });
      });
    }
  }

  leaveStateStealCrab() {}

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(
        `Confirm`,
        () => {
          const victimId = document
            .querySelector(".selected-move")
            .getAttribute("data-player-id");
          this.actStealCrab(parseInt(victimId));
        },
        {
          id: `seaside-confirm`,
          disabled: true,
        }
      );
    }
  }

  //selectIsopods

  actSelectIsopods(isopodIds: number[]) {
    const data: SelectIsopodsActionData = {
      isopodIds: isopodIds.join(","),
    };

    this.bgaPerformAction(SeasideGameActions.SelectIsopods, data);
  }

  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    args.selectableIsopodIds.forEach((isopodId) => {
      const isopodEl = getTokenElById(isopodId);
      isopodEl.classList.add("possible-move");
      isopodEl.addEventListener("click", () => selectMultipleToken(isopodId));
    });
  }

  leaveStateSelectIsopods() {}

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(
        `Confirm`,
        () => {
          const isopodIds = Array.from(
            document.querySelectorAll(".selected-move")
          ).map((el) => parseInt(el.getAttribute("data-id")));
          const newPileSize = isopodIds.length + 1;
          if(args.currentPileSizes.length > 0) {
            const largerPiles = args.currentPileSizes.filter((size) => size > newPileSize);
            const smallerPiles = args.currentPileSizes.filter((size) => size < newPileSize);
            if(largerPiles.length > 0) {
              this.confirmationDialog(`${newPileSize} tokens is less than your current largest pile (${Math.max(...args.currentPileSizes)}), so this pile will be discarded.`, () => {
                this.actSelectIsopods(isopodIds);
              });
            } else if(smallerPiles.length > 0) {
              this.confirmationDialog(`${newPileSize} tokens is your largest pile, all smaller piles will be discarded losing you ${smallerPiles.reduce((a, b) => a + b, 0)} tokens.`, () => {
                this.actSelectIsopods(isopodIds);
              });
            } else {
              this.actSelectIsopods(isopodIds);
            }
          } else {
            this.actSelectIsopods(isopodIds);
          }
        },
        {
          id: `seaside-confirm`,
          disabled: false,
        }
      );
    }
  }
}
