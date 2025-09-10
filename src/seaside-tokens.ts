import { SeasideGame } from "src";

export class TokenManager extends BgaCards.Manager<SeasideToken> {
  public bagStock: CardStock<SeasideToken>;
  public seaStock: SlotStock<SeasideToken>;
  public discardStock: VoidStock<SeasideToken>;
  public playerAreaStocks: Record<string, SlotStock<SeasideToken>> = {};
  public playerAreaSandpiperPileStocks: Record<
    string,
    SlotStock<SeasideToken>
  > = {};

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

    this.setupBagStock();
    this.setupDiscardStock();

    this.setupSeaStock(gameDatas);
    Object.values(gameDatas.players).forEach(async (player) => {
      this.setupPlayerStocks(player);
    });

    document
      .getElementById("seaside-draw-bag")
      .addEventListener("click", () => {
        if (this.game.isCurrentPlayerActive()) {
          this.flipCard(this.bagStock.getCards()[0]);
        }
      });
  }

  private setupBagStock() {
    this.bagStock = new CardStock(
      this,
      document.getElementById("seaside-draw-bag")
    );
    this.addStock(this.bagStock);
  }

  private setupDiscardStock() {
    this.discardStock = new VoidStock(
      this,
      document.getElementById("seaside-discard")
    );
    this.addStock(this.discardStock);
  }

  private setupSeaStock(gameDatas: SeasideGamedatas) {
    this.seaStock = new SlotStock(
      this,
      document.getElementById("seaside-sea-stock"),
      {
        slotsIds: ["ISOPOD", "SHELL", "CRAB"],
        mapCardToSlot: (token: SeasideToken) => token.activeType.toUpperCase(),
        slotClasses: ["seaside-sea-stock-slot"],
      }
    );
    this.addStock(this.seaStock);
    this.seaStock.addCards(Object.values(gameDatas.seaTokens));
  }

  private setupPlayerStocks(player: SeasidePlayer) {
    this.playerAreaStocks[player.id] = new SlotStock(
      this,
      document.getElementById(`seaside-player-${player.id}`),
      {
      slotsIds: ["SHELL", "CRAB", "ROCK", "WAVE", "BEACH"],
      mapCardToSlot: (token: SeasideToken) => token.activeType.toUpperCase(),
      slotClasses: ["seaside-player-area-slot"],
    }
    );
    this.addStock(this.playerAreaStocks[player.id]);
    const tokens = Object.values(player.tokens).filter(
        (t) => t.activeType !== "SANDPIPER" && t.activeType !== "ISOPOD"
    );
    if(tokens.length > 0) {
      this.playerAreaStocks[player.id].addCards(tokens);
    }

    this.playerAreaSandpiperPileStocks[player.id] = new SlotStock(
      this,
      document.getElementById(`seaside-player-${player.id}-sandpiper-pile`),
      {
        slotsIds: [0],
        mapCardToSlot: (token: SeasideToken) => token.locationArg ?? 0,
        slotClasses: ["seaside-player-area-slot-sandpiper"],
        direction: "column",
      }
    );
    this.addStock(this.playerAreaSandpiperPileStocks[player.id]);
    const sandpodTokens = Object.values(player.tokens).filter(
        (t) => t.activeType === "SANDPIPER" || t.activeType === "ISOPOD"
      );
    if (sandpodTokens.length > 0) {
      const pileIds = [...new Set(sandpodTokens.map((t) => t.locationArg))];
        pileIds.forEach(async (pileId) => {
          const tokens = sandpodTokens.filter((t) => t.locationArg == pileId);
          this.createSandpiperPile(tokens, player.id);
        });
    }
  }

  private getTooltip(token: SeasideToken): string {
    return `
        <p><strong>${_("Side A:")}</strong> ${token.side1}</p>
        <p><strong>${_("Side B:")}</strong> ${token.side2}</p>
      `;
  }

  async drawToken(token: SeasideToken) {
    if (!this.bagStock.getCards().includes(token)) {
      await this.bagStock.addCard(token);
    }
  }

  async moveTokenToSea(token: SeasideToken) {
    await this.seaStock.addCard(token, {});
  }

  async moveTokenToPlayerArea(token: SeasideToken, playerId: string) {
    await this.playerAreaStocks[playerId].addCard(token);
  }

  async moveEndGameBonusTokens(tokens: SeasideToken[], playerId: string) {
    const isopods = tokens.filter((t) => t.activeType == "ISOPOD");
    if (isopods.length > 0) {
      await this.createSandpiperPile(isopods, playerId);
    }

    const otherTokens = tokens.filter((t) => t.activeType != "ISOPOD");
    if (otherTokens.length > 0) {
      await this.playerAreaStocks[playerId].addCards(otherTokens);
    }
  }

  setSelectableIsopods(tokens: SeasideToken[]) {
    this.seaStock.setSelectionMode('multiple');
    this.seaStock.setSelectableCards(tokens);
  }

  setSelectableBeaches(playerId: string, tokens: SeasideToken[]) {
    this.playerAreaStocks[playerId].setSelectionMode('single');
    this.playerAreaStocks[playerId].setSelectableCards(tokens);
    this.playerAreaStocks[playerId].onSelectionChange = (selection) => {
      this.game.updateConfirmDisabled(selection.length === 0);
    };
  }

  async createSandpiperPile(tokens: SeasideToken[], playerId: string) {
    this.playerAreaSandpiperPileStocks[playerId].addSlotsIds([
      tokens[0].locationArg,
    ]);
    const isopods = tokens.filter((t) => t.activeType === "ISOPOD");
    const sandpiper = tokens.find((t) => t.activeType === "SANDPIPER");

    if (isopods.length > 0) {
      await this.playerAreaSandpiperPileStocks[playerId].addCards(
        isopods,
        {},
        100
      );
    }
    if (sandpiper) {
      await this.playerAreaSandpiperPileStocks[playerId].addCard(sandpiper);
    }
  }

  async discardSandpiperPile(tokens: SeasideToken[], playerId: string) {
    this.playerAreaSandpiperPileStocks[playerId].removeSlot(
      tokens[0].locationArg
    );
    await this.discardStock.addCards(tokens, {}, 100);
  }

  async moveTokenToDiscard(token: SeasideToken) {
    await this.discardStock.addCard(token);
  }

  clearSelectedTokens() {
    this.seaStock.setSelectionMode('none');
    Object.values(this.gameDatas.players).forEach((player) => {
      this.playerAreaStocks[player.id].setSelectionMode('none');
    });
  }
}
