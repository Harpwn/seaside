import { SeasideGame } from "src";

export class SeasideSetup {
  constructor(private game: SeasideGame) {
    this.game = game;
  }

  doSetup(gamedatas: SeasideGamedatas) {
    this.setupBaseGameArea();
    this.setupPlayerAreas(gamedatas);
    this.setupSea(gamedatas);
    this.setupTooltips();
    this.setupNotifications();
  }

  setupBaseGameArea() {
    this.game.getGameAreaElement().insertAdjacentHTML(
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
      if (this.game.player_id.toString() != player.id) {
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

      if (rowType == "SANDPIPER") {
        row.classList.add(`seaside-player-row-ISOPOD`);
      }
      tokensForRow.forEach((token) => {
        row.appendChild(this.game.tokenToNode(token));
      });
      rowEls.push(row);
    });
    return rowEls.map((el) => el.outerHTML).join("");
  }

  setupTooltips() {
    console.log("tooltips setup");
    const tokens = document.querySelectorAll(".seaside-token");
    tokens.forEach((token) => {
      this.game.addTokenTooltip(token);
    });
  }

  setupSea(gamedatas: SeasideGamedatas) {
    Object.values(gamedatas.seaTokens).forEach((token) => {
      this.game.createTokenInSea(token);
    });
  }

  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.game.bgaSetupPromiseNotifications();
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
