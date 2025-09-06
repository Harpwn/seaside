import { SeasideActions } from "./seaside-actions";
import { SeasideNotifications } from "./seaside-notications";
import { SeasideSetup } from "./seaside-setup";
import { SeasideGameStates, SeasideStateManager } from "./seaside-state";
import { TokenManager } from "./seaside-tokens";

export class SeasideGame extends SeasideNotifications implements Game {
  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
  }

  setup(gamedatas: SeasideGamedatas) {
    console.log("Starting game setup");
    console.log("gamedatas", gamedatas);

    this.animationManager = new AnimationManager(this);
    this.tokens = new TokenManager(this, gamedatas);
    this.setups = new SeasideSetup(this);
    this.states = new SeasideStateManager(this);
    this.actions = new SeasideActions(this);

    this.setups.doSetup(gamedatas);
    this.zoom = new ZoomManager({
      element: document.getElementById("seaside-table"),
      localStorageZoomKey: "mygame-zoom",
      zoomControls: {
        color: "white",
      },
    });

    this.setupNotifications();
    console.log("Ending game setup");
  }

  onEnteringState(stateName: string, payload: any) {
    console.log("Entering state: " + stateName, payload);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.states.enteringPlayTokenState(payload.args);
        break;
      case SeasideGameStates.PlayAgain:
        this.states.enteringPlayAgainState(payload.args);
        break;
      case SeasideGameStates.NextPlayer:
        this.states.enteringNextPlayerState(payload.args);
        break;
      case SeasideGameStates.FlipBeach:
        this.states.enteringFlipBeachState(payload.args);
        break;
      case SeasideGameStates.StealCrab:
        this.states.enteringStealCrabState(payload.args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.states.enteringSelectIsopodsState(payload.args);
        break;
    }
  }

  onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.states.leaveStatePlayToken();
        break;
      case SeasideGameStates.PlayAgain:
        this.states.leaveStatePlayAgain();
        break;
      case SeasideGameStates.NextPlayer:
        this.states.leaveStateNextPlayer();
        break;
      case SeasideGameStates.FlipBeach:
        this.states.leaveStateFlipBeach();
        break;
      case SeasideGameStates.StealCrab:
        this.states.leaveStateStealCrab();
        break;
      case SeasideGameStates.SelectIsopods:
        this.states.leaveStateSelectIsopods();
        break;
    }

    this.clearMoves();
  }

  onUpdateActionButtons(stateName: string, args: any) {
    console.log("Update Action Buttons: " + stateName, args);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.actions.updateActionButtonsPlayToken(args);
        break;
      case SeasideGameStates.PlayAgain:
        this.actions.updateActionButtonsPlayAgain(args);
        break;
      case SeasideGameStates.NextPlayer:
        this.actions.updateActionButtonsNextPlayer(args);
        break;
      case SeasideGameStates.FlipBeach:
        this.actions.updateActionButtonsFlipBeach(args);
        break;
      case SeasideGameStates.StealCrab:
        this.actions.updateActionButtonsStealCrab(args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.actions.updateActionButtonsSelectIsopods(args);
        break;
    }
  }
}
