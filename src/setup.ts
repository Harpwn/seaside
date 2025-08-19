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
        return `<div class="seaside-tile" data-id="${token.id}" data-active-type="${token.activeType}" data-inactive-type="${token.inactiveType}"></div>`;
      });
      if (this.player_id.toString() != player.id) {
        document.getElementById("seaside-other-players").insertAdjacentHTML(
          "beforeend",
          `<div id="seaside-other-player-${
            player.id
          }" class="seaside-other-player">
            ${tokens.join("")}
            </div>`
        );
      } else {
        document.getElementById("seaside-player-area").insertAdjacentHTML(
          "beforeend",
          `<div id="seaside-player-${player.id}" class="seaside-player">
            ${tokens.join("")}
            </div>`
        );
      }
    });
  }

  setupSea(gamedatas: SeasideGamedatas) {
    const seaEl = document.getElementById("seaside-sea-tokens");
    Object.values(gamedatas.seaTokens).forEach((token) => {
      seaEl.insertAdjacentHTML(
        "beforeend",
        `<div class="seaside-tile" data-id="${token.id}" data-active-type="${token.activeType}" data-inactive-type="${token.inactiveType}"></div>`
      );
    });
  }

  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
  }
}
