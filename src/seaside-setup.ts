import { SeasideGame } from "src";
import { SeasideStateManager } from "./seaside-state";
import { SeasideActions } from "./seaside-actions";
import { TokenManager } from "./seaside-tokens";

export class SeasideSetup {
  constructor(private game: SeasideGame) {
    this.game = game;
  }

  async doSetup(gamedatas: SeasideGamedatas) {
    this.setupBaseGameArea();
    this.setupPlayerAreas(gamedatas);

    this.game.animationManager = new BgaAnimations.Manager();
    this.game.states = new SeasideStateManager(this.game);
    this.game.actions = new SeasideActions(this.game);
    this.game.tokens = new TokenManager(this.game, gamedatas);
    this.game.zoom = new ZoomManager({
      element: document.getElementById("seaside-table"),
      localStorageZoomKey: "mygame-zoom",
      zoomControls: {
        color: "white",
      },
    });

    this.game.setupNotifications();
  }

  setupBaseGameArea() {
    this.game.getGameAreaElement().insertAdjacentHTML(
      "beforeend",
      `<div id="seaside-table" class="bga-zoom-inner">
        <div id="seaside-game-area">
          <div class="seaside-sea-area-wrapper">
            <div id="seaside-draw-bag"><span id="bag-counter"></span></div>
            <div id="seaside-discard"></div>
            <div id="seaside-sea-stock">
            </div>
          </div>
        </div>
      </div>`
    );
  }

  setupPlayerAreas(gamedatas: SeasideGamedatas) {
    Object.values(gamedatas.playerorder).forEach((playerId) => {
      const player = gamedatas.players[playerId];
      document.getElementById("seaside-game-area").insertAdjacentHTML(
        "beforeend",
        `<div class="seaside-player-wrapper">
          <div class="seaside-player-name">${player.name}</div>
          <div id="seaside-player-${player.id}" class="seaside-player">
            <div id="seaside-player-${playerId}-sandpiper-pile" class="seaside-player-area-stock-sandpiper"></div>
          </div>
        </div>`
      );
    });
  }

  setupHelpButton() {
    // Setting up player boards
    // example of setting up players boards
    let helpButton = $("seaside-help-button");
    helpButton.insertAdjacentHTML(
      "beforeend",
      `<div class="seaside-help-container">
        <div class="seaside-help-help-button w-12 h-12 text-3xl" onmouseover="this.nextElementSibling.style.display = 'block'" onmouseout="this.nextElementSibling.style.display = 'none'">?</div>        
        <div class="seaside-help-help-tooltip">
            <div class="seaside-help-help-tooltip-text">
              <p class="text-white text-5xl">${_("Player Aid")}</p>
              <span class="text-sm">${_(
                "From the strongest to the weakest"
              )}</span>
              <div class="flex flex-col seaside-help-tooltip-combinations">
                <div><div>${_("Color-Run")}</div></div>
                <div><div>${_("Three of a Kind")}</div></div>
                <div><div>${_("Color")}</div></div>
                <div><div>${_("Run")}</div></div>
                <div><div>${_("Sum")}</div></div>
              </div>
            </div>
        </div>
      </div>`
    );
  }
}
