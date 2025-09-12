// @ts-ignore
GameGui = (function () {
  // this hack required so we fake extend GameGui
  function GameGui() {}
  return GameGui;
})();

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

// @ts-ignore
declare const BgaAnimations;
// @ts-ignore
declare const BgaCards;
// @ts-ignore
declare const BgaZoom;

class Seaside extends GameGui<SeasideGamedatas> implements SeasideGame {
  public animationManager: AnimationManager;
  public tokens: TokenManager;
  public states: SeasideStateManager;
  public actions: SeasideActions;
  public zoom: ZoomManager;

  constructor() {
    super();
  }

  private setupBaseGameArea() {
    this.getGameAreaElement().insertAdjacentHTML(
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
      </div>
      <div class="helpful-buttons flex fixed gap-2">
          <div id="seaside-help"></div>
        </div>
      `
    );
  }

  private setupPlayerAreas(gamedatas: SeasideGamedatas) {
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

  private setupHelpButton() {
    let helpButton = $("seaside-help");
    helpButton.insertAdjacentHTML(
      "beforeend",
      `<div class="seaside-help-container">
        <div class="seaside-help-button w-12 h-12 text-3xl" onmouseover="this.nextElementSibling.style.display = 'block'" onmouseout="this.nextElementSibling.style.display = 'none'">?</div>        
        <div class="seaside-help-tooltip">
            <span id="seaside-player-aid"></span>
        </div>
      </div>`
    );
  }

  public clearMoves() {
    this.tokens.clearSelectedTokens();
  }

  public removeAllClickEvents(element: Element) {
    const clone = element.cloneNode(true) as Element; // Deep clone the element
    element.parentNode.replaceChild(clone, element); // Replace the original with the clone
    return clone;
  }

  public updateConfirmDisabled(disabled: boolean) {
    const confirmButton = document.getElementById("seaside-confirm");
    if (confirmButton) {
      confirmButton.classList.toggle("disabled", disabled);
      confirmButton.removeAttribute("disabled");
      confirmButton.setAttribute("aria-disabled", String(disabled));
    }
  }

  public setTooltip(id: string, html: string) {
    this.addTooltipHtml(id, html);
  }

  setupNotifications() {
    this.bgaSetupPromiseNotifications();
  }

  setup(gamedatas: SeasideGamedatas) {
    this.setupBaseGameArea();
    this.setupPlayerAreas(gamedatas);
    this.setupHelpButton();

    this.animationManager = new BgaAnimations.Manager();
    const cardsManager = new BgaCards.Manager<SeasideToken>({
      animationManager: this.animationManager,
      cardWidth: 100,
      cardHeight: 100,
      cardBorderRadius: "50%",

      isCardVisible: (token: SeasideToken) => {
        return token.flipped;
      },
      setupDiv: (token: SeasideToken, div: HTMLElement) => {
        div.classList.add("seaside-token");
        this.setTooltip(div.id, this.getTooltip(token));
      },
      setupBackDiv: (token: SeasideToken, div: HTMLElement) => {
        div.setAttribute("data-type", token.side1);
      },
      setupFrontDiv: (token: SeasideToken, div: HTMLElement) => {
        div.setAttribute("data-type", token.side2);
      },
    });
    this.tokens = new TokenManager(this, gamedatas, cardsManager);
    this.states = new SeasideStateManager(this, this.tokens);
    this.actions = new SeasideActions(this, this.tokens);
    this.zoom = new BgaZoom.Manager({
      element: document.getElementById("seaside-table"),
      localStorageZoomKey: "mygame-zoom",
      zoomControls: {
        color: "white",
      },
    });

    this.setupNotifications();
  }

  private getTooltip(token: SeasideToken): string {
    return `
        <p><strong>${_("Side A:")}</strong> ${token.side1}</p>
        <p><strong>${_("Side B:")}</strong> ${token.side2}</p>
      `;
  }

  onEnteringState(stateName: string, payload: any) {
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

  async notif_tokenPlayed(args: TokenPlayedNotificationData) {}

  async notif_tokenToSea(args: TokenToSeaNotificationData) {
    await this.tokens.moveTokenToSea(args.token);
  }

  async notif_tokenToPlayerArea(args: TokenToPlayerAreaNotificationData) {
    await this.tokens.moveTokenToPlayerArea(
      args.token,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(1);
  }

  async notif_tokenMovesWithinPlayerArea(
    args: TokenMovesWithinPlayerAreaNotificationData
  ) {
    await this.tokens.moveTokenToPlayerArea(
      args.token,
      args.playerId.toString()
    );
  }

  async notif_crabStolen(args: CrabStolenNotificationData) {
    await this.tokens.moveTokenToPlayerArea(
      args.token,
      args.thiefId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(-1);
    this.scoreCtrl[args.thiefId].incValue(1);
  }

  async notif_rockGetsCrabs(args: RockGetsCrabsNotificationData) {
    for (const token of args.tokens) {
      await this.tokens.moveTokenToPlayerArea(token, args.playerId.toString());
    }
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  async notif_beachGetsShells(args: BeachGetsShellsNotificationData) {
    for (const token of args.tokens) {
      await this.tokens.moveTokenToPlayerArea(token, args.playerId.toString());
    }
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  async notif_createSandpiperPile(args: CreateSandpiperPileNotificationData) {
    await this.tokens.createSandpiperPile(
      args.tokens,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }

  async notif_sandpiperIsopodsLost(args: SandpiperIsopodsLostNotificationData) {
    await this.tokens.discardSandpiperPile(
      args.tokens,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(-args.tokenCount);
  }

  async notif_beachFlip(args: BeachFlipNotificationData) {}

  async notif_endGameWaveBonusTie(args: EndGameWaveBonusTieNotificationData) {
    for (const playerId of Object.keys(args.playerIdsAndTokens)) {
      const tokens = args.playerIdsAndTokens[playerId];
      await this.tokens.moveEndGameBonusTokens(tokens, playerId);
      this.scoreCtrl[playerId].incValue(tokens.length);
    }
  }

  async notif_endGameWaveBonus(args: EndGameWaveBonusNotificationData) {
    await this.tokens.moveEndGameBonusTokens(
      args.tokens,
      args.playerId.toString()
    );
    this.scoreCtrl[args.playerId].incValue(args.tokenCount);
  }
}
