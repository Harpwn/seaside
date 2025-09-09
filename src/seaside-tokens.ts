import { SeasideGame } from "src";

export class TokenManager extends BgaCards.Manager<SeasideToken> {
  private bagStock: CardStock<SeasideToken>;
  private seaStock: SlotStock<SeasideToken>;
  private discardStock: VoidStock<SeasideToken>;
  private playerAreaStocks: Record<string, SlotStock<SeasideToken>> = {};
  private playerAreaSandpiperPileStocks: Record<string, SlotStock<SeasideToken>> = {};

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
      setupDiv: (token: SeasideToken, div: HTMLElement) => {
        div.classList.add("seaside-token");
        this.game.setTooltip(div.id, this.getTooltip(token));
      },
      setupBackDiv: (token: SeasideToken, div: HTMLElement) => {
        div.setAttribute("data-type", token.side1);
      },
      setupFrontDiv: (token: SeasideToken, div: HTMLElement) => {
        div.setAttribute("data-type", token.side2);
      },
    });

    this.bagStock = new CardStock(this, document.getElementById('seaside-draw-bag'));
    this.addStock(this.bagStock);
    this.seaStock = new SlotStock(this, document.getElementById('seaside-sea-stock'), 
      { 
        slotsIds: ['ISOPOD', 'SHELL', 'CRAB'], 
        mapCardToSlot: (token: SeasideToken) => token.activeType.toUpperCase(),
        slotClasses: ["seaside-sea-stock-slot"]
      });
    this.addStock(this.seaStock);
    this.discardStock = new VoidStock(this, document.getElementById('seaside-discard'));
    this.addStock(this.discardStock);
    const slotSettings: SlotStockSettings<SeasideToken> = {
      slotsIds: ['SHELL', 'CRAB', 'ROCK', 'WAVE', 'BEACH'],
      mapCardToSlot: (token: SeasideToken) => token.activeType.toUpperCase() == "ISOPOD" ? "SANDPIPER" : token.activeType.toUpperCase(),
      slotClasses: ["seaside-player-area-slot"]
    };
    this.gameDatas.playerorder.forEach(playerId => {
      this.playerAreaStocks[playerId] = new SlotStock(this, document.getElementById(`seaside-player-${playerId}`), slotSettings);
      this.addStock(this.playerAreaStocks[playerId]);
      this.playerAreaSandpiperPileStocks[playerId] = new SlotStock(this, document.getElementById(`seaside-player-${playerId}-sandpiper-pile`), {
        slotsIds: [],
        mapCardToSlot: (token: SeasideToken) => token.locationArg,
        slotClasses: ["seaside-player-area-slot-sandpiper"],
        direction: "column"
      });
      this.addStock(this.playerAreaSandpiperPileStocks[playerId]);
    });

    document.getElementById('seaside-draw-bag').addEventListener("click", () => {
      if(this.game.isCurrentPlayerActive()) {
        this.flipCard(this.bagStock.getCards()[0]);
      }
    });

  }

  private getTooltip(token: SeasideToken): string {
    return `
        <p><strong>${_("Active Side:")}</strong> ${token.activeType}</p>
        <p><strong>${_("Inactive Side:")}</strong> ${token.inactiveType}</p>
        <p><strong>${_("Pile:")}</strong> ${token.locationArg}</p>
      `;
  }

  async drawToken(token: SeasideToken) {
    await this.bagStock.addCard(token);
  }

  async moveTokenToSea(token: SeasideToken) {
    await this.seaStock.addCard(token, {  });
  }

  async moveTokenToPlayerArea(token: SeasideToken, playerId: string) {
    await this.playerAreaStocks[playerId].addCard(token);
  }

  async moveEndGameBonusTokens(tokens: SeasideToken[], playerId: string) {
    const isopods = tokens.filter(t => t.activeType === 'ISOPOD');
    for (const token of isopods) {
      await this.createSandpiperPile(isopods, playerId);
    }
    const otherTokens = tokens.filter(t => t.activeType !== 'ISOPOD');
    for (const token of otherTokens) {
      await this.moveTokenToPlayerArea(token, playerId);
    }
  }

  async createSandpiperPile(tokens: SeasideToken[], playerId: string) {
    this.playerAreaSandpiperPileStocks[playerId].addSlotsIds([tokens[0].locationArg]);
    const isopods = tokens.filter(t => t.activeType === 'ISOPOD');
    const sandpiper = tokens.find(t => t.activeType === 'SANDPIPER');
    await this.playerAreaSandpiperPileStocks[playerId].addCards(isopods, {}, 100);
    await this.playerAreaSandpiperPileStocks[playerId].addCard(sandpiper);
  }

  async discardSandpiperPile(tokens: SeasideToken[], playerId: string) {
    this.playerAreaSandpiperPileStocks[playerId].removeSlot(tokens[0].locationArg);
    await this.discardStock.addCards(tokens, {}, 100);
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
    await this.discardStock.addCard(token);
  }

  async setupTokens(gamedatas: SeasideGamedatas) {
    await this.seaStock.addCards(Object.values(gamedatas.seaTokens));
    await Promise.all(Object.values(gamedatas.players).map(async (player) => {
      const tokens = Object.values(player.tokens).filter(t => t.activeType !== 'SANDPIPER' && t.activeType !== 'ISOPOD');
      await this.playerAreaStocks[player.id].addCards(tokens);
      const sandpodTokens = Object.values(player.tokens).filter(t => t.activeType === 'SANDPIPER' || t.activeType === 'ISOPOD');
      if(sandpodTokens.length > 0) {
        //get unique pile ids
        const pileIds = [...new Set(sandpodTokens.map(t => t.locationArg))];
        pileIds.forEach(async pileId => {
          const tokens = sandpodTokens.filter(t => t.locationArg == pileId);
          await this.createSandpiperPile(tokens, player.id);
        });
      }
    }));
  }

  getSelectableCardClass() {
    return "possible-move";
  }

  getSelectedCardClass() {
    return "selected-move";
  }

  clearSelectedTokens() {
    this.selectedTokens = [];
  }
}