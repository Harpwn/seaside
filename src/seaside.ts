import GameGui from "ebg/core/gamegui";
import { SeasideGameStates } from "./enums";

// Note: it does not really extend it in es6 way, you cannot call super you have to use dojo way
export const Seaside: GameGui<SeasideGamedatas> = {

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

    Object.keys(gamedatas.players).forEach(player_id => {
      if(this.player_id.toString() != player_id) {
        document.getElementById("seaside-other-players").insertAdjacentHTML("beforeend", `<div id="seaside-other-player-${player_id}" class="seaside-other-player"></div>`);
      }
    });

    //Per player, create a "Shore" area

    //Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  },

   onEnteringState(stateName: string, args: any) {
    console.log("Entering state: " + stateName, args);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.drawToken(args.token);
        if (this.isCurrentPlayerActive()) {
          
        }
        break;
      case SeasideGameStates.NextPlayer:
        break;
      case SeasideGameStates.FlipBeach:
        break;
      case SeasideGameStates.StealCrab:
        break;
      case SeasideGameStates.SelectIsopods:
        break;
    }
  },

  onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        break;
      case SeasideGameStates.NextPlayer:
        break;
      case SeasideGameStates.FlipBeach:
        break;
      case SeasideGameStates.StealCrab:
        break;
      case SeasideGameStates.SelectIsopods:
        break;
    }
  },

  onUpdateActionButtons(stateName: string, args: any) {
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        break;
      case SeasideGameStates.NextPlayer:
        break;
      case SeasideGameStates.FlipBeach:
        break;
      case SeasideGameStates.StealCrab:
        break;
      case SeasideGameStates.SelectIsopods:
        break;
    }
  },

  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
  },

  drawToken(token: SeasideToken) {
    document.getElementById("seaside-draw-bag")
      .insertAdjacentHTML("beforeend", `
        <div class="tile tile-crab" />
        <div class="tile tile-sandpiper" />
      `)
  }
}