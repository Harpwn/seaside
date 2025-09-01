import { addTokenTooltip, createTokenInSea, tokenToNode } from "./utils";

export class SeasideSetup extends GameGui<SeasideGamedatas> {
  setup(gamedatas: SeasideGamedatas) {
    console.log("Starting game setup");
    console.log("gamedatas", gamedatas);

    this.setupBaseGameArea(gamedatas);
    this.setupPlayerAreas(gamedatas);
    this.setupSea(gamedatas);
    this.setupTooltips();

    //Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  setupBaseGameArea(gamedatas: SeasideGamedatas) {
    this.getGameAreaElement().insertAdjacentHTML(
      "beforeend",
      `<div id="seaside-game-area">
        <div id="seaside-sea">
          <div id="seaside-other-players"></div>
          <div id="seaside-sea-area">
            <div class="seaside-sea-area-row" id="seaside-sea-area-ISOPOD"></div>
            <div class="seaside-sea-area-row" id="seaside-sea-area-CRAB"></div>
            <div class="seaside-sea-area-row" id="seaside-sea-area-SHELL"></div>
          </div>
          <div id="seaside-player-area"></div>
        </div>
      </div>`
    );
  }

  setupPlayerAreas(gamedatas: SeasideGamedatas) {
    Object.values(gamedatas.players).forEach((player) => {
      if (this.player_id.toString() != player.id) {
        document.getElementById("seaside-other-players").insertAdjacentHTML(
          "beforeend",
          `<div id="seaside-player-${
            player.id
          }" class="seaside-player seaside-other-player" data-player-id="${
            player.id
          }">
            ${this.setupTokenRows(Object.values(player.tokens))}
          </div>`
        );
      } else {
        document.getElementById("seaside-player-area").insertAdjacentHTML(
          "beforeend",
          `<div id="seaside-player-${player.id}" class="seaside-player">
            ${this.setupTokenRows(Object.values(player.tokens))}
            </div>`
        );
      }
    });
  }

  setupTokenRows(tokens: SeasideToken[]) {
    const rowTypes = ["SANDPIPER", "BEACH", "SHELL", "WAVE", "CRAB", "ROCK"];
    const rowEls: Element[] = [];
    rowTypes.forEach((rowType) => {
      const tokensForRow: SeasideToken[] = [];
      switch (rowType) {
        case "SANDPIPER-ISOPOD":
          tokensForRow.push(
            ...tokens.filter(
              (t) => t.activeType === "SANDPIPER" || t.activeType === "ISOPOD"
            )
          );
          break;
        default:
          tokensForRow.push(...tokens.filter((t) => t.activeType === rowType));
          break;
      }
      const row = document.createElement("div");
      row.classList.add("seaside-player-row", `seaside-player-row-${rowType}`);

      if(rowType == "SANDPIPER") {
        row.classList.add(`seaside-player-row-ISOPOD`);
      }
      tokensForRow.forEach((token) => {
        row.appendChild(tokenToNode(token));
      });
      rowEls.push(row);
    });
    return rowEls.map((el) => el.outerHTML).join("");
  }

  setupTooltips() {
    console.log("tooltips setup");
    const tokens = document.querySelectorAll(".seaside-token");
    tokens.forEach((token) => {
      addTokenTooltip(token, this);
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
