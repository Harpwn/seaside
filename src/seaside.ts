import { PlayTokenActionData } from "./actions";
import {
  SeasideFlipBeachArgs,
  SeasideNextPlayerArgs,
  SeasidePlayTokenArgs,
  SeasideSelectIsopodsArgs,
  SeasideStealCrabArgs,
} from "./args";
import { SeasideGameStates, SeassideGameActions } from "./enums";

export class SeasideGameGui extends GameGui<SeasideGamedatas> {
  setup(gamedatas: SeasideGamedatas) {
    console.log("Starting game setup");
    console.log("gamedatas", gamedatas);

    // Example to add a div on the game area
    this.getGameAreaElement().insertAdjacentHTML(
      "beforeend",
      `<div id="seaside-game-area">
        <div id="seaside-sea">
          <div id="seaside-draw-bag"></div>
          <div id="seaside-other-players"></div>
          <div id="seaside-sea-tokens">
          </div>
          <div id="seaside-player-area"></div>
        </div>
      </div>`
    );

    Object.keys(gamedatas.players).forEach((player_id) => {
      if (this.player_id.toString() != player_id) {
        document
          .getElementById("seaside-other-players")
          .insertAdjacentHTML(
            "beforeend",
            `<div id="seaside-other-player-${player_id}" class="seaside-other-player"></div>`
          );
      }
    });

    //Per player, create a "Shore" area

    //Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  onEnteringState(stateName: string, payload: any) {
    console.log("Entering state: " + stateName, payload);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.enteringPlayTokenState(payload.args);
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
    this.drawToken(args.token);
  }

  enteringNextPlayerState(args: SeasideNextPlayerArgs) {}

  enteringFlipBeachState(args: SeasideFlipBeachArgs) {}

  enteringStealCrabState(args: SeasideStealCrabArgs) {}

  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {}

  onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.leaveStatePlayToken();
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
  }

  leaveStatePlayToken() {}

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
        this.playTokenSide(args.token, args.token.activeType)
      );
      this.statusBar.addActionButton(
        `Play ${args.token.inactiveType} Side`,
        () => this.playTokenSide(args.token, args.token.inactiveType)
      );
    }
  }

  playTokenSide(token: SeasideToken, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      token_id: token.id,
      token_type: tokenType,
    };

    const tokenEl = this.getTokenById(token.id);

    if(token.activeType !== tokenType) {
      this.flipToken(tokenEl);
    }

    this.bgaPerformAction(SeassideGameActions.PlayToken, data);
  }

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {}

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {}

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {}

  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
  }

  drawToken(token: SeasideToken) {
    document.getElementById("seaside-draw-bag").insertAdjacentHTML(
      "beforeend",
      `
        <div class="seaside-tile" data-id="${token.id}" data-active-type="${token.activeType}" data-inactive-type="${token.inactiveType}" />
      `
    );
  }

  getTokenById(tokenId: number): Element {
    return document.querySelector(`.seaside-tile[data-id="${tokenId}"]`);
  }

  flipToken(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    tokenEl.setAttribute("data-active-type", inactiveType);
    tokenEl.setAttribute("data-inactive-type", activeType);
  }

  async notif_tokenPlayed(args) {
  }
}
