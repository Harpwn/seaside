import { createTokenInSea, tokenToNode } from "./utils";

export class SeasideSetup extends GameGui<SeasideGamedatas> {
  setup(gamedatas: SeasideGamedatas) {
    console.log("Starting game setup");
    console.log("gamedatas", gamedatas);

    this.setupBaseGameArea(gamedatas);
    this.setupPlayerAreas(gamedatas);
    this.setupSea(gamedatas);

    //Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  setupBaseGameArea(gamedatas: SeasideGamedatas) {
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
  }

  setupPlayerAreas(gamedatas: SeasideGamedatas) {
    Object.values(gamedatas.players).forEach((player) => {
      const tokens = Object.values(player.tokens).map((token) => {
        return tokenToNode(token);
      });
      if (this.player_id.toString() != player.id) {
        document.getElementById("seaside-other-players").insertAdjacentHTML(
          "beforeend",
          `<div id="seaside-player-${player.id}" class="seaside-player seaside-other-player" data-player-id="${player.id}">
            ${tokens.map(token => token.outerHTML).join("")}
            </div>`
        );
      } else {
        document.getElementById("seaside-player-area").insertAdjacentHTML(
          "beforeend",
          `<div id="seaside-player-${player.id}" class="seaside-player">
            ${tokens.map(token => token.outerHTML).join("")}
            </div>`
        );
      }
    });
  }

  setupSea(gamedatas: SeasideGamedatas) {
    Object.values(gamedatas.seaTokens).forEach((token) => {
      createTokenInSea(token, this);
    });
  }

  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
  }
}
