enum SeasideGameNotifications {
  TokenPlayed = "tokenPlayed",
  TokenToSea = "tokenToSea",
  TokenToPlayerArea = "tokenToPlayerArea",
  TokenMovesWithinPlayerArea = "tokenMovesWithinPlayerArea",
  CrabStolen = "crabStolen",
  RockGetsCrabs = "rockGetsCrabs",
  BeachFlip = "beachFlip",
  BeachGetsShells = "beachGetsShells",
  SandpiperGetsIsopods = "sandpiperGetsIsopods",
  SandpiperIsopodsLost = "sandpiperIsopodsLost",
  EndGameWaveBonus = "endGameWaveBonus",
  EndGameWaveBonusTie = "endGameWaveBonusTie",
}

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

export class SeasideGame extends GameGui<SeasideGamedatas> {
  async notif_tokenPlayed(args: TokenPlayedNotificationData) {
    const tokenEl = this.getTokenElById(args.tokenId);
    //flip is needed
    if (tokenEl.getAttribute("data-active-type") !== args.tokenSide) {
      this.flipToken(tokenEl);
    }
  }

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    await this.moveTokenToSea(args.tokenId, args.tokenLocationArgs);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    await this.moveTokenToPlayerArea(
      args.playerId.toString(),
      args.tokenId,
      args.tokenLocationArgs
    );
    this.scoreCtrl[args.playerId].incValue(1);
  }

  async notif_tokenMovesWithinPlayerArea(
    args: TokenMovesWithinPlayerAreaNotificationData
  ) {
    await this.moveTokenToPlayerArea(
      args.playerId.toString(),
      args.tokenId,
      args.toLocationArgs
    );
  }

  async notif_crabStolen(args: CrabStolenNotificationData) {
    await this.moveTokenToPlayerArea(args.thiefId.toString(), args.tokenId, 0);
    this.scoreCtrl[args.playerId].incValue(-1);
    this.scoreCtrl[args.thiefId].incValue(1);
  }

  async notif_rockGetsCrabs(args: RockGetsCrabsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await this.moveTokenToPlayerArea(args.playerId.toString(), tokenId, 0);
    }
    this.scoreCtrl[args.playerId].incValue(args.crabCount);
  }

  async notif_beachGetsShells(args: BeachGetsShellsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await this.moveTokenToPlayerArea(args.playerId.toString(), tokenId, 0);
    }
    this.scoreCtrl[args.playerId].incValue(args.shellCount);
  }

  async notif_sandpiperGetsIsopods(args: SandpiperGetsIsopodsNotificationData) {
    for (const tokenId of args.tokenIds) {
      await this.moveTokenToPlayerArea(
        args.playerId.toString(),
        tokenId,
        args.newSandpiperPileId
      );
    }
    this.scoreCtrl[args.playerId].incValue(args.isopodCount);
  }

  async notif_sandpiperIsopodsLost(args: SandpiperIsopodsLostNotificationData) {
    await this.moveTokenToDiscard(args.sandpiperId);
    this.scoreCtrl[args.playerId].incValue(-1);
    for (const tokenId of args.tokenIds) {
      await this.moveTokenToDiscard(tokenId);
    }
    this.scoreCtrl[args.playerId].incValue(-args.isopodCount);
  }

  async notif_beachFlip(args: BeachFlipNotificationData) {
    //await this.flipToken(this.getTokenElById(args.tokenId));
  }

  async notif_endGameWaveBonusTie(args: EndGameWaveBonusTieNotificationData) {
    Object.keys(args.playerIdsAndTokenIds).forEach((playerId) => {
      const tokenIds = args.playerIdsAndTokenIds[playerId];
      tokenIds.forEach(async (seaTokenId) => {
        await this.moveTokenToPlayerArea(playerId, seaTokenId, 0);
      });
      this.scoreCtrl[playerId].incValue(tokenIds.length);
    });
  }

  async notif_endGameWaveBonus(args: EndGameWaveBonusNotificationData) {
    args.tokenIds.forEach(async (seaTokenId) => {
      await this.moveTokenToPlayerArea(
        args.playerId.toString(),
        seaTokenId,
        0
      );
    });
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

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

      if (rowType == "SANDPIPER") {
        row.classList.add(`seaside-player-row-ISOPOD`);
      }
      tokensForRow.forEach((token) => {
        row.appendChild(this.tokenToNode(token));
      });
      rowEls.push(row);
    });
    return rowEls.map((el) => el.outerHTML).join("");
  }

  setupTooltips() {
    console.log("tooltips setup");
    const tokens = document.querySelectorAll(".seaside-token");
    tokens.forEach((token) => {
      this.addTokenTooltip(token);
    });
  }

  setupSea(gamedatas: SeasideGamedatas) {
    Object.values(gamedatas.seaTokens).forEach((token) => {
      this.createTokenInSea(token);
    });
  }

  setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
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

    this.clearMoves();
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

  actPlayToken(args: SeasidePlayTokenArgs, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: tokenType,
    };

    if (tokenType == "SANDPIPER") {
      this.handlePlaySandpiper(args);
    } else {
      const tokenEl = this.getTokenElById(args.token.id);

      if (args.token.activeType !== tokenType) {
        this.flipToken(tokenEl);
      }

      this.bgaPerformAction(SeasideGameActions.PlayToken, data);
    }
  }

  handlePlaySandpiper(args: SeasidePlayTokenArgs) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: "SANDPIPER",
    };
    const tokenEl = this.getTokenElById(args.token.id);

    if (
      args.selectableIsopodIds.length == 0 &&
      args.currentPileSizes.some((size) => size > 1)
    ) {
      this.confirmationDialog(
        "There are no Isopods in the sea and you have an existing pile bigger than one, playing this will cause it to be discarded.",
        () => {
          if (args.token.activeType !== "SANDPIPER") {
            this.flipToken(tokenEl);
          }

          this.bgaPerformAction(SeasideGameActions.PlayToken, data);
        }
      );
    } else {
      if (args.token.activeType !== "SANDPIPER") {
        this.flipToken(tokenEl);
      }

      this.bgaPerformAction(SeasideGameActions.PlayToken, data);
    }
  }

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    this.drawToken(args.token);
  }

  leaveStatePlayToken() {}

  updateActionButtonsPlayToken(args: SeasidePlayTokenArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(`Play ${args.token.activeType} Side`, () =>
        this.actPlayToken(args, args.token.activeType)
      );
      this.statusBar.addActionButton(
        `Play ${args.token.inactiveType} Side`,
        () => this.actPlayToken(args, args.token.inactiveType)
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
        const beachEl = this.getTokenElById(beachId);
        beachEl.classList.add("possible-move");
        beachEl.addEventListener("click", () => {
          this.selectSingleToken(beachId);
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
          const beachEl = document.querySelector(".selected-move");
          this.actFlipBeach(this.getTokenId(beachEl));
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
          this.selectSinglePlayer(playerId);
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
    if (this.isCurrentPlayerActive()) {
      args.selectableIsopodIds.forEach((isopodId) => {
        const isopodEl = this.getTokenElById(isopodId);
        isopodEl.classList.add("possible-move");
        isopodEl.addEventListener("click", () => this.selectMultipleToken(isopodId));
      });
    }
  }

  leaveStateSelectIsopods() {}

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(
        `Confirm`,
        () => {
          const isopodIds = Array.from(
            document.querySelectorAll(".selected-move")
          ).map((el) => this.getTokenId(el));
          const newPileSize = isopodIds.length + 1;
          if (args.currentPileSizes.length > 0) {
            const largerPiles = args.currentPileSizes.filter(
              (size) => size > newPileSize
            );
            const smallerPiles = args.currentPileSizes.filter(
              (size) => size < newPileSize
            );
            if (largerPiles.length > 0) {
              this.confirmationDialog(
                `${newPileSize} tokens is less than your current largest pile (${Math.max(
                  ...args.currentPileSizes
                )}), so this pile will be discarded.`,
                () => {
                  this.actSelectIsopods(isopodIds);
                }
              );
            } else if (smallerPiles.length > 0) {
              this.confirmationDialog(
                `${newPileSize} tokens is your largest pile, all smaller piles will be discarded losing you ${smallerPiles.reduce(
                  (a, b) => a + b,
                  0
                )} tokens.`,
                () => {
                  this.actSelectIsopods(isopodIds);
                }
              );
            } else {
              this.actSelectIsopods(isopodIds);
            }
          } else {
            console.log(isopodIds);
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

  drawToken(token: SeasideToken) {
    const tokenEl = document
      .getElementById("seaside-game-area")
      .insertAdjacentElement("beforeend", this.tokenToNode(token));
    this.addTokenTooltip(tokenEl);
  };

  getTokenElById(tokenId: number): Element {
    return document.getElementById(`seaside-token-${tokenId}`);
  };

  flipToken(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    tokenEl.setAttribute("data-active-type", inactiveType);
    tokenEl.setAttribute("data-inactive-type", activeType);
  };

  async moveTokenToSea (tokenId: number, tokenLocationArgs: number) {
    const oldTokenEl = this.getTokenElById(tokenId);
    this.updateTokenElLocation(oldTokenEl, "SEA", tokenLocationArgs);
    const seaEl = document.getElementById(
      `seaside-sea-area-${this.getTokenActiveType(oldTokenEl)}`
    );
    const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
    newTokenEl.removeAttribute("style");
    newTokenEl.classList.add("seaside-token-hidden");
    seaEl.insertAdjacentElement("beforeend", newTokenEl);
    await this.bgaPlayDojoAnimation(
      this.slideToObjectAndDestroy(oldTokenEl, newTokenEl)
    );
    newTokenEl.classList.remove("seaside-token-hidden");
  };

  async moveTokenToDiscard(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    const anim = this.fadeOutAndDestroy(tokenEl);
    await this.bgaPlayDojoAnimation(anim);
  };

  async moveTokenToPlayerArea(
    playerId: string,
    tokenId: number,
    tokenLocationArgs: number,
  ) {
    const oldTokenEl = this.getTokenElById(tokenId);
    const type = this.getTokenActiveType(oldTokenEl);
    this.updateTokenElLocation(oldTokenEl, playerId, tokenLocationArgs);
    const playerAreaRowEl = document
      .getElementById(`seaside-player-${playerId}`)
      .getElementsByClassName(`seaside-player-row-${type}`)[0];
    const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
    newTokenEl.removeAttribute("style");
    newTokenEl.classList.add("seaside-token-hidden");
    playerAreaRowEl.insertAdjacentElement("beforeend", newTokenEl);
    await this.bgaPlayDojoAnimation(
      this.slideToObjectAndDestroy(oldTokenEl, newTokenEl)
    );
    newTokenEl.classList.remove("seaside-token-hidden");
  };

  createTokenInSea(token: SeasideToken) {
    const seaEl = document.getElementById(
      `seaside-sea-area-${token.activeType}`
    );
    const tokenEl = this.tokenToNode(token);

    seaEl.insertAdjacentElement("beforeend", tokenEl);
  };

  tokenToNode(token: SeasideToken): Element {
    const tokenEl = document.createElement("div");
    tokenEl.id = `seaside-token-${token.id}`;
    tokenEl.className = "seaside-token";
    tokenEl.setAttribute("data-id", token.id.toString());
    tokenEl.setAttribute("data-active-type", token.activeType);
    tokenEl.setAttribute("data-inactive-type", token.inactiveType);
    tokenEl.setAttribute("data-location", token.location);
    tokenEl.setAttribute("data-location-arg", token.locationArg);
    return tokenEl;
  };

  clearMoves() {
    const possibleMoveEls = document.querySelectorAll(".possible-move");
    possibleMoveEls.forEach((el) => {
      el.classList.remove("possible-move");
      this.removeAllClickEvents(el);
    });
    const selectedMoveEls = document.querySelectorAll(".selected-move");
    selectedMoveEls.forEach((el) => {
      el.classList.remove("selected-move");
      this.removeAllClickEvents(el);
    });
  };

  selectSinglePlayer(playerId: number) {
    const playerPanel = document.getElementById(`seaside-player-${playerId}`);
    playerPanel.classList.add("selected-move");
    const newEl = this.removeAllClickEvents(playerPanel);
    newEl.addEventListener("click", () => this.deselectSinglePlayer(playerId));
    const otherSelectedPlayerPanels =
      document.querySelectorAll(".selected-move");
    otherSelectedPlayerPanels.forEach((panel) => {
      if (panel !== newEl) {
        panel.classList.remove("selected-move");
        const newOtherPlanel = this.removeAllClickEvents(panel);
        const otherPlayerId = newOtherPlanel.getAttribute("data-player-id");
        newOtherPlanel.addEventListener("click", () =>
          this.selectSinglePlayer(parseInt(otherPlayerId))
        );
      }
    });
    this.updateConfirmDisabled(false);
  };

  deselectSinglePlayer(playerId: number) {
    const playerPanel = document.getElementById(`seaside-player-${playerId}`);
    playerPanel.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(playerPanel);
    newEl.addEventListener("click", () => this.selectSinglePlayer(playerId));
    this.updateConfirmDisabled(true);
  };

  selectMultipleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.add("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectMultipleToken(tokenId));
  };

  deselectMultipleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectMultipleToken(tokenId));
  };

  selectSingleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.add("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectSingleToken(tokenId));
    const otherSelectedTokens = document.querySelectorAll(".selected-move");
    otherSelectedTokens.forEach((token) => {
      if (token !== newEl) {
        token.classList.remove("selected-move");
        const newOtherToken = this.removeAllClickEvents(token);
        const otherTokenId = this.getTokenId(newOtherToken);
        newOtherToken.addEventListener("click", () =>
          this.selectSingleToken(otherTokenId)
        );
      }
    });
    this.updateConfirmDisabled(false);
  };

  deselectSingleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectSingleToken(tokenId));
    this.updateConfirmDisabled(true);
  };

  removeAllClickEvents(element: Element) {
    const clone = element.cloneNode(true) as Element; // Deep clone the element
    element.parentNode.replaceChild(clone, element); // Replace the original with the clone
    return clone;
  };

  updateConfirmDisabled(disabled: boolean) {
    const confirmButton = document.getElementById("seaside-confirm");
    if (confirmButton) {
      confirmButton.classList.toggle("disabled", disabled);
      confirmButton.removeAttribute("disabled");
      confirmButton.setAttribute("aria-disabled", String(disabled));
    }
  };

  updateTokenElLocation(element: Element, location: string, locationArg: number) {
    element.setAttribute("data-location", location);
    element.setAttribute("data-location-arg", locationArg.toString());
  };

  addTokenTooltip(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    this.addTooltip(
      tokenEl.id,
      "Sides - " + activeType + " / " + inactiveType,
      ""
    );
  };

  getTokenId(tokenEl: Element): number {
    return parseInt(tokenEl.getAttribute("data-id"));
  };

  getTokenActiveType(tokenEl: Element): string {
    return tokenEl.getAttribute("data-active-type");
  };
}
