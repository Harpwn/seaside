class TokenManager {
  public bagStock: CardStock<SeasideToken>;
  public seaStock: SlotStock<SeasideToken>;
  public discardStock: VoidStock<SeasideToken>;
  public hoverTimers;
  public playerAreaStocks: Record<string, SlotStock<SeasideToken>> = {};
  public playerAreaSandpiperPileStocks: Record<
    string,
    SlotStock<SeasideToken>
  > = {};
  public playerEndGameScoringStocks: Record<string, CardStock<SeasideToken>> =
    {};

  constructor(
    public game: SeasideGame,
    private gameDatas: SeasideGamedatas,
    private cards: CardManager<SeasideToken>
  ) {
    this.setupBagStock(gameDatas);
    this.setupDiscardStock();

    this.setupSeaStock(gameDatas);
    Object.values(gameDatas.players).forEach(async (player) => {
      this.setupPlayerStocks(player);
    });
  }

  private setupBagStock(gamedatas: SeasideGamedatas) {
    this.bagStock = new BgaCards.CardStock(
      this.cards,
      document.getElementById("seaside-draw-bag")
    );
    if (!!gamedatas.bagToken) {
      this.bagStock.addCard(gamedatas.bagToken);
    }
    this.cards.addStock(this.bagStock);
  }

  private setupDiscardStock() {
    this.discardStock = new BgaCards.VoidStock(
      this.cards,
      document.getElementById("seaside-discard")
    );
    this.cards.addStock(this.discardStock);
  }

  private setupSeaStock(gameDatas: SeasideGamedatas) {
    this.seaStock = new BgaCards.SlotStock(
      this.cards,
      document.getElementById("seaside-sea-stock"),
      {
        slotsIds: ["ISOPOD", "SHELL", "CRAB"],
        mapCardToSlot: (token: SeasideToken) => token.activeType.toUpperCase(),
        slotClasses: ["seaside-sea-stock-slot"],
      }
    );
    this.cards.addStock(this.seaStock);
    this.seaStock.addCards(Object.values(gameDatas.seaTokens));
  }

  private setupPlayerStocks(player: SeasidePlayer) {
    if (this.game.gamedatas.gamestate.name == "gameEnd") {
      this.playerEndGameScoringStocks[player.id] = new BgaCards.CardStock(
        this.cards,
        document.getElementById(`seaside-endgame-scoring-stock-${player.id}`),
        {
          counter: { show: true, position: "top" },
        }
      );
      this.playerEndGameScoringStocks[player.id].addCards(
        Object.values(player.tokens)
      );
      this.cards.addStock(this.playerEndGameScoringStocks[player.id]);
      return;
    }

    this.playerAreaStocks[player.id] = new BgaCards.SlotStock(
      this.cards,
      document.getElementById(`seaside-player-${player.id}`),
      {
        slotsIds: ["SHELL", "CRAB", "ROCK", "WAVE", "BEACH"],
        mapCardToSlot: (token: SeasideToken) => token.activeType.toUpperCase(),
        slotClasses: ["seaside-player-area-slot"],
      }
    );
    this.cards.addStock(this.playerAreaStocks[player.id]);
    const tokens = Object.values(player.tokens).filter(
      (t) => t.activeType !== "SANDPIPER" && t.activeType !== "ISOPOD"
    );
    if (tokens.length > 0) {
      this.playerAreaStocks[player.id].addCards(tokens);
    }

    this.playerAreaSandpiperPileStocks[player.id] = new BgaCards.SlotStock(
      this.cards,
      document.getElementById(`seaside-player-${player.id}-sandpiper-pile`),
      {
        slotsIds: [0],
        mapCardToSlot: (token: SeasideToken) => token.locationArg ?? 0,
        slotClasses: ["seaside-player-area-slot-sandpiper"],
        direction: "column",
      }
    );
    this.cards.addStock(this.playerAreaSandpiperPileStocks[player.id]);
    const sandpodTokens = Object.values(player.tokens).filter(
      (t) => t.activeType === "SANDPIPER" || t.activeType === "ISOPOD"
    );
    if (sandpodTokens.length > 0) {
      const pileIds = [...new Set(sandpodTokens.map((t) => t.locationArg))];
      pileIds.forEach(async (pileId) => {
        const tokens = sandpodTokens.filter((t) => t.locationArg == pileId);
        this.createSandpiperPile(tokens, player.id, true);
      });
    }

    this.playerEndGameScoringStocks[player.id] = new BgaCards.CardStock(
      this.cards,
      document.getElementById(`seaside-endgame-scoring-stock-${player.id}`),
      {
        counter: { show: true, position: "top" },
      }
    );
    this.cards.addStock(this.playerEndGameScoringStocks[player.id]);
  }

  async performEndGameScoring(tokensByPlayer: Record<number, SeasideToken[]>) {
    for (const playerId of Object.keys(tokensByPlayer)) {
      const tokens = tokensByPlayer[Number(playerId)];
      for (const token of tokens) {
        await this.playerEndGameScoringStocks[playerId].addCard(token, {
          duration: 100,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
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
    this.seaStock.setSelectionMode("multiple");
    this.seaStock.setSelectableCards(tokens);
    this.game.updateConfirmDisabled(false);
  }

  setSelectableBeaches(playerId: string, tokens: SeasideToken[]) {
    this.playerAreaStocks[playerId].setSelectionMode("single");
    this.playerAreaStocks[playerId].setSelectableCards(tokens);
    this.playerAreaStocks[playerId].onSelectionChange = (selection) => {
      this.game.updateConfirmDisabled(selection.length === 0);
    };
    this.playerAreaSandpiperPileStocks[playerId].getCards().forEach((token) => {
      this.cards
        .getCardElement(token)
        .classList.add(this.cards.getUnselectableCardStyle().class);
    });
  }

  async createSandpiperPile(
    tokens: SeasideToken[],
    playerId: string,
    isSetup: boolean = false
  ) {
    this.playerAreaSandpiperPileStocks[playerId].addSlotsIds([
      tokens[0].locationArg,
    ]);
    const isopods = tokens.filter((t) => t.activeType === "ISOPOD");
    const sandpiper = tokens.find((t) => t.activeType === "SANDPIPER");

    if (isopods.length > 0) {
      if (isSetup) {
        this.playerAreaSandpiperPileStocks[playerId].addCards(isopods);
      } else {
        await this.playerAreaSandpiperPileStocks[playerId].addCards(
          isopods,
          {},
          100
        );
      }
    }
    if (sandpiper) {
      if (isSetup) {
        this.playerAreaSandpiperPileStocks[playerId].addCard(sandpiper);
      } else {
        await this.playerAreaSandpiperPileStocks[playerId].addCard(sandpiper);
      }
    }
  }

  async discardSandpiperPile(tokens: SeasideToken[], playerId: string) {
    await this.discardStock.addCards(tokens, {}, 100);
    this.playerAreaSandpiperPileStocks[playerId].removeSlot(
      tokens[0].locationArg
    );
  }

  async moveTokenToDiscard(token: SeasideToken) {
    await this.discardStock.addCard(token);
  }

  clearSelectedTokens() {
    this.seaStock.setSelectionMode("none");
    Object.values(this.gameDatas.players).forEach((player) => {
      this.playerAreaStocks[player.id].setSelectionMode("none");
      this.playerAreaSandpiperPileStocks[player.id]
        .getCards()
        .forEach((token) => {
          this.cards
            .getCardElement(token)
            .classList.remove(this.cards.getUnselectableCardStyle().class);
        });
    });
  }
}
