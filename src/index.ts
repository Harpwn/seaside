import { SeasideActions } from "./seaside-actions";
import { SeasideSetup } from "./seaside-setup";
import { SeasideStateManager } from "./seaside-state";
import { TokenManager } from "./tokens";

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
  public animationManager: AnimationManager;
  public cardsManager: TokenManager;
  public setupManager: SeasideSetup;
  public stateManager: SeasideStateManager;
  public actions: SeasideActions;

  setup(gamedatas: SeasideGamedatas) {
    console.log("Starting game setup");
    console.log("gamedatas", gamedatas);

    this.animationManager = new BgaAnimations.Manager({
      animationsActive: this.bgaAnimationsActive(),
    });
    this.cardsManager = new TokenManager(this, gamedatas);
    this.setupManager = new SeasideSetup(this);
    this.stateManager = new SeasideStateManager(this);
    this.actions = new SeasideActions(this);

    this.setupManager.doSetup(gamedatas);

    console.log("Ending game setup");
  }

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
      await this.moveTokenToPlayerArea(args.playerId.toString(), seaTokenId, 0);
    });
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  onEnteringState(stateName: string, payload: any) {
    console.log("Entering state: " + stateName, payload);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.stateManager.enteringPlayTokenState(payload.args);
        break;
      case SeasideGameStates.PlayAgain:
        this.stateManager.enteringPlayAgainState(payload.args);
        break;
      case SeasideGameStates.NextPlayer:
        this.stateManager.enteringNextPlayerState(payload.args);
        break;
      case SeasideGameStates.FlipBeach:
        this.stateManager.enteringFlipBeachState(payload.args);
        break;
      case SeasideGameStates.StealCrab:
        this.stateManager.enteringStealCrabState(payload.args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.stateManager.enteringSelectIsopodsState(payload.args);
        break;
    }
  }

  onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.stateManager.leaveStatePlayToken();
        break;
      case SeasideGameStates.PlayAgain:
        this.stateManager.leaveStatePlayAgain();
        break;
      case SeasideGameStates.NextPlayer:
        this.stateManager.leaveStateNextPlayer();
        break;
      case SeasideGameStates.FlipBeach:
        this.stateManager.leaveStateFlipBeach();
        break;
      case SeasideGameStates.StealCrab:
        this.stateManager.leaveStateStealCrab();
        break;
      case SeasideGameStates.SelectIsopods:
        this.stateManager.leaveStateSelectIsopods();
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

  drawToken(token: SeasideToken) {
    const tokenEl = document
      .getElementById("seaside-game-area")
      .insertAdjacentElement("beforeend", this.tokenToNode(token));
    this.addTokenTooltip(tokenEl);
  }

  getTokenElById(tokenId: number): Element {
    return document.getElementById(`seaside-token-${tokenId}`);
  }

  flipToken(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    tokenEl.setAttribute("data-active-type", inactiveType);
    tokenEl.setAttribute("data-inactive-type", activeType);
  }

  async moveTokenToSea(tokenId: number, tokenLocationArgs: number) {
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
  }

  async moveTokenToDiscard(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    const anim = this.fadeOutAndDestroy(tokenEl);
    await this.bgaPlayDojoAnimation(anim);
  }

  async moveTokenToPlayerArea(
    playerId: string,
    tokenId: number,
    tokenLocationArgs: number
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
  }

  createTokenInSea(token: SeasideToken) {
    const seaEl = document.getElementById(
      `seaside-sea-area-${token.activeType}`
    );
    const tokenEl = this.tokenToNode(token);

    seaEl.insertAdjacentElement("beforeend", tokenEl);
  }

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
  }

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
  }

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
  }

  deselectSinglePlayer(playerId: number) {
    const playerPanel = document.getElementById(`seaside-player-${playerId}`);
    playerPanel.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(playerPanel);
    newEl.addEventListener("click", () => this.selectSinglePlayer(playerId));
    this.updateConfirmDisabled(true);
  }

  selectMultipleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.add("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectMultipleToken(tokenId));
  }

  deselectMultipleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectMultipleToken(tokenId));
  }

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
  }

  deselectSingleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectSingleToken(tokenId));
    this.updateConfirmDisabled(true);
  }

  removeAllClickEvents(element: Element) {
    const clone = element.cloneNode(true) as Element; // Deep clone the element
    element.parentNode.replaceChild(clone, element); // Replace the original with the clone
    return clone;
  }

  updateConfirmDisabled(disabled: boolean) {
    const confirmButton = document.getElementById("seaside-confirm");
    if (confirmButton) {
      confirmButton.classList.toggle("disabled", disabled);
      confirmButton.removeAttribute("disabled");
      confirmButton.setAttribute("aria-disabled", String(disabled));
    }
  }

  updateTokenElLocation(
    element: Element,
    location: string,
    locationArg: number
  ) {
    element.setAttribute("data-location", location);
    element.setAttribute("data-location-arg", locationArg.toString());
  }

  addTokenTooltip(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    this.addTooltip(
      tokenEl.id,
      "Sides - " + activeType + " / " + inactiveType,
      ""
    );
  }

  getTokenId(tokenEl: Element): number {
    return parseInt(tokenEl.getAttribute("data-id"));
  }

  getTokenActiveType(tokenEl: Element): string {
    return tokenEl.getAttribute("data-active-type");
  }

  setTooltip(id: string, html: string) {
    this.addTooltipHtml(id, html);
  }
}
