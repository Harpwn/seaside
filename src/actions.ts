import {
  clearMoves,
  drawToken,
  flipToken,
  getTokenElById,
  selectSinglePlayer,
  selectMultipleToken,
  selectSingleToken
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

interface NextPlayerActionData {}

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
}

export class SeasideActions extends GameGui<SeasideGamedatas> {
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

  actFlipBeach(tokenId: number) {
    const data: FlipBeachActionData = {
      beachId: tokenId,
    };

    this.bgaPerformAction(SeasideGameActions.FlipBeach, data);
  }

  actStealCrab(victimId: number) {
    const data: StealCrabActionData = {
      victimId,
    };

    this.bgaPerformAction(SeasideGameActions.StealCrab, data);
  }

  actSelectIsopods(isopodIds: number[]) {
    const data: SelectIsopodsActionData = {
      isopodIds: isopodIds.join(","),
    };

    this.bgaPerformAction(SeasideGameActions.SelectIsopods, data);
  }

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

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    drawToken(args.token);
  }

  enteringPlayAgainState(args: SeasidePlayAgainArgs) {
    //Play some kind of animation
  }

  enteringNextPlayerState(args: SeasideNextPlayerArgs) {}

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

  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {
    args.selectableIsopodIds.forEach((isopodId) => {
      const isopodEl = getTokenElById(isopodId);
      isopodEl.classList.add("possible-move");
      isopodEl.addEventListener("click", () => selectMultipleToken(isopodId));
    });
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

  leaveStatePlayToken() {}

  leaveStatePlayAgain() {}

  leaveStateNextPlayer() {}

  leaveStateFlipBeach() {}

  leaveStateStealCrab() {}

  leaveStateSelectIsopods() {}

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

  updateActionButtonsPlayAgain(args: SeasidePlayAgainArgs) {}

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(`Confirm`, () => {
        const beachId = document.querySelector(".selected-move").getAttribute('data-id');
        this.actFlipBeach(parseInt(beachId));
      }, {
        id: `seaside-confirm`,
        disabled: true
      });
    }
  }

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(`Confirm`, () => {
        const victimId = document.querySelector(".selected-move").getAttribute('data-player-id');
        this.actStealCrab(parseInt(victimId));
      }, {
        id: `seaside-confirm`,
        disabled: true
      });
    }
  }

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(`Confirm`, () => {
        const isopodIds = Array.from(
          document.querySelectorAll(".selected-move")
        ).map((el) => parseInt(el.getAttribute("data-id")));
        this.actSelectIsopods(isopodIds);
      }, {
        id: `seaside-confirm`,
        disabled: false
      });
    }
  }
}
