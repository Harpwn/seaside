enum SeasideGameActions {
  PlayToken = "actPlayToken",
  NextPlayer = "actNextPlayer",
  FlipBeach = "actFlipBeach",
  StealCrab = "actStealCrab",
  SelectIsopods = "actSelectIsopods",
}

class SeasideActions {
  constructor(private gameGui: GameGui, private tokens: TokenManager) {
  }

  actPlayToken(args: SeasidePlayTokenArgs, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: tokenType,
    };

    if (tokenType == "SANDPIPER") {
      this.handlePlaySandpiper(args);
    } else {
      this.gameGui.bgaPerformAction(SeasideGameActions.PlayToken, data);
    }
  }

  handlePlaySandpiper(args: SeasidePlayTokenArgs) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: "SANDPIPER",
    };
    if (
      args.selectableIsopods.length == 0 &&
      args.currentPileSizes.some((size) => size > 1)
    ) {
      this.gameGui.confirmationDialog(
        "There are no Isopods in the sea and you have an existing pile bigger than one, playing this will cause it to be discarded.",
        () => {
          this.gameGui.bgaPerformAction(SeasideGameActions.PlayToken, data);
        }
      );
    } else {
      this.gameGui.bgaPerformAction(SeasideGameActions.PlayToken, data);
    }
  }

  actFlipBeach(tokenId: number) {
    const data: FlipBeachActionData = {
      beachId: tokenId,
    };

    this.gameGui.bgaPerformAction(SeasideGameActions.FlipBeach, data);
  }

  actStealCrab(victimId: number) {
    const data: StealCrabActionData = {
      victimId,
    };

    this.gameGui.bgaPerformAction(SeasideGameActions.StealCrab, data);
  }

  actSelectIsopods(isopodIds: number[]) {
    const data: SelectIsopodsActionData = {
      isopodIds: isopodIds.join(","),
    };

    this.gameGui.bgaPerformAction(SeasideGameActions.SelectIsopods, data);
  }

  updateActionButtonsPlayToken(args: SeasidePlayTokenArgs) {
    if (this.gameGui.isCurrentPlayerActive()) {
      this.gameGui.statusBar.addActionButton(`Play ${args.token.side1} Side`, () =>
        this.actPlayToken(args, args.token.side1)
      );
      this.gameGui.statusBar.addActionButton(`Play ${args.token.side2} Side`, () =>
        this.actPlayToken(args, args.token.side2)
      );
    }
  }

  updateActionButtonsPlayAgain(args: SeasidePlayAgainArgs) {}

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {
    if (this.gameGui.isCurrentPlayerActive()) {
      args.playersWithCrabs.forEach((player) => {
        this.gameGui.statusBar.addActionButton(
          `${player.name}`,
          () => this.actStealCrab(player.id)
        );
      });
    }
  }

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {
    if (this.gameGui.isCurrentPlayerActive()) {
      this.gameGui.statusBar.addActionButton(
        `Confirm`,
        () => {
          const beachToken = this.tokens.playerAreaStocks[this.gameGui.player_id].getSelection()[0];
          this.actFlipBeach(beachToken.id);
        },
        {
          id: `seaside-confirm`,
          disabled: true,
        }
      );
    }
  }

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {
    if (this.gameGui.isCurrentPlayerActive()) {
      this.gameGui.statusBar.addActionButton(
        `Confirm`,
        () => {
          const isopodTokenIds = this.tokens.seaStock.getSelection().map(t => t.id);
          const newPileSize = isopodTokenIds.length + 1;
          if (args.currentPileSizes.length > 0) {
            const largerPiles = args.currentPileSizes.filter(
              (size) => size > newPileSize
            );
            const smallerPiles = args.currentPileSizes.filter(
              (size) => size < newPileSize
            );
            if (largerPiles.length > 0) {
              this.gameGui.confirmationDialog(
                `${newPileSize} tokens is less than your current largest pile (${Math.max(
                  ...args.currentPileSizes
                )}), so this pile will be discarded.`,
                () => {
                  this.actSelectIsopods(isopodTokenIds);
                }
              );
            } else if (smallerPiles.length > 0) {
              this.gameGui.confirmationDialog(
                `${newPileSize} tokens is your largest pile, all smaller piles will be discarded losing you ${smallerPiles.reduce(
                  (a, b) => a + b,
                  0
                )} tokens.`,
                () => {
                  this.actSelectIsopods(isopodTokenIds);
                }
              );
            } else {
              this.actSelectIsopods(isopodTokenIds);
            }
          } else {
            this.actSelectIsopods(isopodTokenIds);
          }
        },
        {
          id: `seaside-confirm`,
          disabled: false,
        }
      );
    }
  }
}
