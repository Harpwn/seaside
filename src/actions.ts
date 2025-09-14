enum SeasideGameActions {
  PlayToken = "actPlayToken",
  NextPlayer = "actNextPlayer",
  FlipBeach = "actFlipBeach",
  StealCrab = "actStealCrab",
  SelectIsopods = "actSelectIsopods",
}

class SeasideActions {
  constructor(private game: SeasideGame, private tokens: TokenManager) {
  }

  actPlayToken(args: SeasidePlayTokenArgs, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: tokenType,
    };

    if (tokenType == "SANDPIPER") {
      this.handlePlaySandpiper(args);
    } else {
      this.game.bgaPerformAction(SeasideGameActions.PlayToken, data);
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
      this.game.confirmationDialog(this.game.gamedatas.sandPiperWarnings["EMPTY_SEA"],
        () => {
          this.game.bgaPerformAction(SeasideGameActions.PlayToken, data);
        }
      );
    } else {
      this.game.bgaPerformAction(SeasideGameActions.PlayToken, data);
    }
  }

  actFlipBeach(tokenId: number) {
    const data: FlipBeachActionData = {
      beachId: tokenId,
    };

    this.game.bgaPerformAction(SeasideGameActions.FlipBeach, data);
  }

  actStealCrab(victimId: number) {
    const data: StealCrabActionData = {
      victimId,
    };

    this.game.bgaPerformAction(SeasideGameActions.StealCrab, data);
  }

  actSelectIsopods(isopodIds: number[]) {
    const data: SelectIsopodsActionData = {
      isopodIds: isopodIds.join(","),
    };

    this.game.bgaPerformAction(SeasideGameActions.SelectIsopods, data);
  }

  updateActionButtonsPlayToken(args: SeasidePlayTokenArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(`Play ${args.token.side1} Side`, () =>
        this.actPlayToken(args, args.token.side1)
      );
      this.game.statusBar.addActionButton(`Play ${args.token.side2} Side`, () =>
        this.actPlayToken(args, args.token.side2)
      );
    }
  }

  updateActionButtonsPlayAgain(args: SeasidePlayAgainArgs) {}

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {
    if (this.game.isCurrentPlayerActive()) {
      args.playersWithCrabs.forEach((player) => {
        this.game.statusBar.addActionButton(
          `${player.name}`,
          () => this.actStealCrab(player.id)
        );
      });
    }
  }

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(
        `Confirm`,
        () => {
          const beachToken = this.tokens.playerAreaStocks[this.game.player_id].getSelection()[0];
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
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(
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
              this.game.confirmationDialog(
                this.game.gamedatas.sandPiperWarnings["SMALLER_PILE"]
                  .replace("!NEW_PILE_SIZE", newPileSize.toString())
                  .replace("!MAX_PILE_SIZE", Math.max(...args.currentPileSizes).toString()),
                () => {
                  this.actSelectIsopods(isopodTokenIds);
                }
              );
            } else if (smallerPiles.length > 0) {
              this.game.confirmationDialog(
                this.game.gamedatas.sandPiperWarnings["LARGER_PILE"]
                  .replace("!NEW_PILE_SIZE", newPileSize.toString())
                  .replace("!OTHER_PILE_TOKEN_COUNTS", smallerPiles.reduce((a, b) => a + b, 0).toString()),
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
