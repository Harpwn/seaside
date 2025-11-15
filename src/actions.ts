enum SeasideGameActions {
  PlayToken = "actPlayToken",
  NextPlayer = "actNextPlayer",
  FlipBeach = "actFlipBeach",
  StealCrab = "actStealCrab",
  SelectIsopods = "actSelectIsopods",
  Undo = "actUndo",
}

class SeasideActions {
  constructor(private game: SeasideGame, private tokens: TokenManager) {}

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

  actUndo() {
    this.game.bgaPerformAction(SeasideGameActions.Undo, {});
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
      this.game.confirmationDialog(
        this.game.gamedatas.sandPiperWarnings["EMPTY_SEA"],
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

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {
    if (this.game.isCurrentPlayerActive()) {
      args.playersWithCrabs.forEach((player) => {
        this.game.statusBar.addActionButton(`${player.name}`, () =>
          this.actStealCrab(player.id)
        );
      });
      this.game.statusBar.addActionButton(`Undo`, () => this.actUndo(), {
        color: "alert",
      });
    }
  }

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(
        `Confirm`,
        () => {
          const beachToken =
            this.tokens.playerAreaStocks[this.game.player_id].getSelection()[0];
          this.actFlipBeach(beachToken.id);
        },
        {
          id: `seaside-confirm`,
          disabled: true,
        }
      );
      this.game.statusBar.addActionButton(`Undo`, () => this.actUndo(), {
        color: "alert",
      });
    }
  }

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(
        `Confirm`,
        () => this.handleSelectIsopodsConfirm(args),
        {
          id: `seaside-confirm`,
          disabled: false,
        }
      );
      this.game.statusBar.addActionButton(`Take all`, () => {
        args.selectableIsopods.forEach((token) => {
          this.tokens.seaStock.selectCard(token);
        });
        this.handleSelectIsopodsConfirm(args);
      });
      this.game.statusBar.addActionButton(`Undo`, () => this.actUndo(), {
        color: "alert",
      });
    }
  }

  handleSelectIsopodsConfirm(args: SeasideSelectIsopodsArgs) {
    const seaIsopodTokens = args.selectableIsopods;
    const selectedIsopodTokenIds = this.tokens.seaStock
      .getSelection()
      .map((t) => t.id);
    const newPileSize = selectedIsopodTokenIds.length + 1;
    const playerDidntSelectAnyButCouldHave =
      selectedIsopodTokenIds.length == 0 && seaIsopodTokens.length > 0;
    const playerHasNoExistingPiles = args.currentPileSizes.length == 0;

    if (playerHasNoExistingPiles) {
      if (!playerDidntSelectAnyButCouldHave) {
        this.actSelectIsopods(selectedIsopodTokenIds);
      } else {
        this.game.confirmationDialog(
          this.game.gamedatas.sandPiperWarnings[
            "NONE_SELECTED_BUT_AVAILABLE"
          ].replace("!SEA_ISOPOD_COUNT", seaIsopodTokens.length.toString()),
          () => {
            this.actSelectIsopods(selectedIsopodTokenIds);
          }
        );
      }
      return;
    }

    const largerPiles = args.currentPileSizes.filter(
      (size) => size > newPileSize
    );
    const smallerPiles = args.currentPileSizes.filter(
      (size) => size < newPileSize
    );

    const playerPlayingSmallerPile = largerPiles.length > 0;
    const playerPlayingLargestPile = smallerPiles.length > 0;

    if (playerPlayingSmallerPile) {
      this.game.confirmationDialog(
        this.game.gamedatas.sandPiperWarnings["SMALLER_PILE"]
          .replace("!NEW_PILE_SIZE", newPileSize.toString())
          .replace(
            "!MAX_PILE_SIZE",
            Math.max(...args.currentPileSizes).toString()
          ),
        () => {
          this.actSelectIsopods(selectedIsopodTokenIds);
        }
      );
      return;
    }

    if (playerPlayingLargestPile) {
      this.game.confirmationDialog(
        this.game.gamedatas.sandPiperWarnings["LARGER_PILE"]
          .replace("!NEW_PILE_SIZE", newPileSize.toString())
          .replace(
            "!OTHER_PILE_TOKEN_COUNTS",
            smallerPiles.reduce((a, b) => a + b, 0).toString()
          ),
        () => {
          this.actSelectIsopods(selectedIsopodTokenIds);
        }
      );
      return;
    }

    if (playerDidntSelectAnyButCouldHave) {
      this.game.confirmationDialog(
        this.game.gamedatas.sandPiperWarnings[
          "NONE_SELECTED_BUT_AVAILABLE"
        ].replace("!SEA_ISOPOD_COUNT", seaIsopodTokens.length.toString()),
        () => {
          this.actSelectIsopods(selectedIsopodTokenIds);
        }
      );
      return;
    }

    this.actSelectIsopods(selectedIsopodTokenIds);
  }
}