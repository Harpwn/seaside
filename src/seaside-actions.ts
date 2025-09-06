import { SeasideGameGui } from "./seaside-gui";

enum SeasideGameActions {
  PlayToken = "actPlayToken",
  NextPlayer = "actNextPlayer",
  FlipBeach = "actFlipBeach",
  StealCrab = "actStealCrab",
  SelectIsopods = "actSelectIsopods",
}

export class SeasideActions {
  constructor(private game: SeasideGameGui) {
    this.game = game;
  }

  actPlayToken(args: SeasidePlayTokenArgs, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: tokenType,
    };

    if (tokenType == "SANDPIPER") {
      this.handlePlaySandpiper(args);
    } else {
      const tokenEl = this.game.tokens.getTokenElById(args.token.id);

      if (args.token.activeType !== tokenType) {
        this.game.tokens.flipToken(tokenEl);
      }

      this.game.bgaPerformAction(SeasideGameActions.PlayToken, data);
    }
  }
  
  handlePlaySandpiper(args: SeasidePlayTokenArgs) {
    const data: PlayTokenActionData = {
      tokenId: args.token.id,
      tokenType: "SANDPIPER",
    };
    const tokenEl = this.game.tokens.getTokenElById(args.token.id);

    if (
      args.selectableIsopodIds.length == 0 &&
      args.currentPileSizes.some((size) => size > 1)
    ) {
      this.game.confirmationDialog(
        "There are no Isopods in the sea and you have an existing pile bigger than one, playing this will cause it to be discarded.",
        () => {
          if (args.token.activeType !== "SANDPIPER") {
            this.game.tokens.flipToken(tokenEl);
          }

          this.game.bgaPerformAction(SeasideGameActions.PlayToken, data);
        }
      );
    } else {
      if (args.token.activeType !== "SANDPIPER") {
        this.game.tokens.flipToken(tokenEl);
      }

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
      this.game.statusBar.addActionButton(
        `Play ${args.token.activeType} Side`,
        () => this.actPlayToken(args, args.token.activeType)
      );
      this.game.statusBar.addActionButton(
        `Play ${args.token.inactiveType} Side`,
        () => this.actPlayToken(args, args.token.inactiveType)
      );
    }
  }

  updateActionButtonsPlayAgain(args: SeasidePlayAgainArgs) {}

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(
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

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {
    if (this.game.isCurrentPlayerActive()) {
      this.game.statusBar.addActionButton(
        `Confirm`,
        () => {
          const beachEl = document.querySelector(".selected-move");
          this.actFlipBeach(this.game.tokens.getTokenId(beachEl));
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
          const isopodIds = Array.from(
            document.querySelectorAll(".selected-move")
          ).map((el) => this.game.tokens.getTokenId(el));
          const newPileSize = isopodIds.length + 1;
          if (args.currentPileSizes.length > 0) {
            const largerPiles = args.currentPileSizes.filter(
              (size) => size > newPileSize
            );
            const smallerPiles = args.currentPileSizes.filter(
              (size) => size < newPileSize
            );
            if (largerPiles.length > 0) {
              this.game.confirmationDialog(
                `${newPileSize} tokens is less than your current largest pile (${Math.max(
                  ...args.currentPileSizes
                )}), so this pile will be discarded.`,
                () => {
                  this.actSelectIsopods(isopodIds);
                }
              );
            } else if (smallerPiles.length > 0) {
              this.game.confirmationDialog(
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
}
