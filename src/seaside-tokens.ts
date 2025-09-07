import { SeasideGame } from "src";

export class TokenManager extends BgaCards.Manager<SeasideToken> {
  private bagStock: CardStock<SeasideToken>;
  private seaStock: CardStock<SeasideToken>;
  private discardStock: VoidStock<SeasideToken>;
  private playerAreaStocks: Record<string, CardStock<SeasideToken>> = {};

  private selectedTokens: SeasideToken[] = [];

  constructor(public game: SeasideGame, private gameDatas: SeasideGamedatas) {
    //@ts-ignore
    super({
      animationManager: game.animationManager,
      cardWidth: 100,
      cardHeight: 100,
      cardBorderRadius: "50%",
      isCardVisible: (token: SeasideToken) => {
        return token.flipped;
      },
      setupBackDiv: (token: SeasideToken, div: HTMLElement) => {
        div.classList.add("seaside-token");
        div.setAttribute("data-type", token.side1);
        this.game.setTooltip(div.id, this.getTooltip(token));
      },
      setupFrontDiv: (token: SeasideToken, div: HTMLElement) => {
        div.classList.add("seaside-token");
        div.setAttribute("data-type", token.side2);
        this.game.setTooltip(div.id, this.getTooltip(token));
      },
    });

    this.bagStock = new CardStock(this, document.getElementById('seaside-draw-bag'));
    this.addStock(this.bagStock);
    this.seaStock = new CardStock(this, document.getElementById('seaside-sea-area'));
    this.addStock(this.seaStock);
    this.discardStock = new VoidStock(this, document.getElementById('seaside-discard'));
    this.addStock(this.discardStock);
    this.gameDatas.playerorder.forEach(playerId => {
      this.playerAreaStocks[playerId] = new CardStock(this, document.getElementById(`seaside-player-${playerId}`));
      this.addStock(this.playerAreaStocks[playerId]);
    });

  }

  private getTooltip(token: SeasideToken): string {
    return `
        <p><strong>${_("Active Side:")}</strong> ${token.activeType}</p>
        <p><strong>${_("Inactive Side:")}</strong> ${token.inactiveType}</p>
        <p><strong>${_("Pile:")}</strong> ${token.locationArg}</p>
      `;
  }

  drawToken(token: SeasideToken) {
    this.bagStock.addCard(token);
    this.getCardElement(token).onclick = () => {
      if(this.game.isCurrentPlayerActive()) {
        this.flipCard(token);
      }
    };
  }

  moveTokenToSea(token: SeasideToken) {
    this.seaStock.addCard(token);
  }

  moveTokenToPlayerArea(token: SeasideToken, playerId: string) {
    this.playerAreaStocks[playerId].addCard(token);
  }

  selectMultipleToken(token: SeasideToken) {
    const tokenEl = this.getCardElement(token);
    tokenEl.classList.add(this.getSelectedCardClass());
    this.selectedTokens.push(token);
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectMultipleToken(token));
  }

  deselectMultipleToken(token: SeasideToken) {
    const tokenEl = this.getCardElement(token);
    tokenEl.classList.remove(this.getSelectedCardClass());
    this.selectedTokens = this.selectedTokens.filter(t => t !== token);
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectMultipleToken(token));
  }

  getSelectedTokens(): SeasideToken[] {
    return this.selectedTokens;
  }

  selectSingleToken(token: SeasideToken) {
    const tokenEl = this.getCardElement(token);
    tokenEl.classList.add(this.getSelectedCardClass());
    this.selectedTokens.push(token);
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectSingleToken(token));
    this.selectedTokens.forEach((selectedToken) => {
      if (selectedToken != token) {
        const tokenEl = this.getCardElement(selectedToken);
        tokenEl.classList.remove(this.getSelectedCardClass());
        this.selectedTokens = this.selectedTokens.filter(t => t !== selectedToken);
        const newOtherToken = this.game.removeAllClickEvents(tokenEl);
        newOtherToken.addEventListener("click", () =>
          this.selectSingleToken(selectedToken)
        );
      }
    });
    this.game.updateConfirmDisabled(false);
  }

  deselectSingleToken(token: SeasideToken) {
    const tokenEl = this.getCardElement(token);
    tokenEl.classList.remove(this.getSelectedCardClass());
    this.selectedTokens = this.selectedTokens = [];
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectSingleToken(token));
    this.game.updateConfirmDisabled(true);
  }

  async moveTokenToDiscard(token: SeasideToken) {
    this.removeCard(token);
  }

  setupTokens(gamedatas: SeasideGamedatas) {
    this.seaStock.addCards(Object.values(gamedatas.seaTokens));
    Object.values(gamedatas.players).forEach((player) => {
      this.playerAreaStocks[player.id].addCards(Object.values(player.tokens));
    });
  }

  getSelectableCardClass() {
    return "possible-move";
  }

  getSelectedCardClass() {
    return "selected-move";
  }
}