import { drawToken, flipToken, getTokenElById } from "./utils";

enum SeasideGameActions {
    PlayToken = "actPlayToken",
    NextPlayer = "actNextPlayer",
    FlipBeach = "actFlipBeach",
    StealCrab = "actStealCrab",
    SelectIsopods = "actSelectIsopods"
}

enum SeasideGameStates {
  PlayToken = "playToken",
  StealCrab = "stealCrab",
  FlipBeach = "flipBeach",
  SelectIsopods = "selectIsopods",
  NextPlayer = "nextPlayer",
  GameEnd = "gameEnd",
}


interface PlayTokenActionData {
    token_id: number;
    token_type: SeasideTokenType;
}

interface NextPlayerActionData {
}

interface FlipBeachActionData {
    beach_id: number;
}

interface StealCrabActionData {
    victim_id: number[];
}

interface SelectIsopodsActionData {
    isopod_ids: number[];
}

interface SeasidePlayTokenArgs {
  token: SeasideToken;
}

interface SeasideNextPlayerArgs {}

interface SeasideFlipBeachArgs {
  flippableBeachIds: number[];
}

interface SeasideStealCrabArgs {
  playersWithCrabsIds: number[];
}

interface SeasideSelectIsopodsArgs {
  selectableIsopodIds: number[];
}

export class SeasideActions extends GameGui<SeasideGamedatas> {

  actPlayToken(token: SeasideToken, tokenType: SeasideTokenType) {
    const data: PlayTokenActionData = {
      token_id: token.id,
      token_type: tokenType,
    };

    const tokenEl = getTokenElById(token.id);

    if(token.activeType !== tokenType) {
      flipToken(tokenEl);
    }

    this.bgaPerformAction(SeasideGameActions.PlayToken, data);
  }

  onEnteringState(stateName: string, payload: any) {
    console.log("Entering state: " + stateName, payload);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.enteringPlayTokenState(payload.args);
        break;
      case SeasideGameStates.NextPlayer:
        this.enteringNextPlayerState(payload.args);
        break;
      case SeasideGameStates.FlipBeach:
        this.enteringFlipBeachState(payload.args);
        break;
      case SeasideGameStates.StealCrab:
        this.enteringStealCrabState(payload.args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.enteringSelectIsopodsState(payload.args);
        break;
    }
  }

  enteringPlayTokenState(args: SeasidePlayTokenArgs) {
    drawToken(args.token);
  }

  enteringNextPlayerState(args: SeasideNextPlayerArgs) {}

  enteringFlipBeachState(args: SeasideFlipBeachArgs) {}

  enteringStealCrabState(args: SeasideStealCrabArgs) {}

  enteringSelectIsopodsState(args: SeasideSelectIsopodsArgs) {}

  onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.leaveStatePlayToken();
        break;
      case SeasideGameStates.NextPlayer:
        this.leaveStateNextPlayer();
        break;
      case SeasideGameStates.FlipBeach:
        this.leaveStateFlipBeach();
        break;
      case SeasideGameStates.StealCrab:
        this.leaveStateStealCrab();
        break;
      case SeasideGameStates.SelectIsopods:
        this.leaveStateSelectIsopods();
        break;
    }
  }

  leaveStatePlayToken() {}

  leaveStateNextPlayer() {}

  leaveStateFlipBeach() {}

  leaveStateStealCrab() {}

  leaveStateSelectIsopods() {}

  onUpdateActionButtons(stateName: string, args: any) {
    console.log("Update Action Buttons: " + stateName, args);
    switch (stateName) {
      case SeasideGameStates.PlayToken:
        this.updateActionButtonsPlayToken(args);
        break;
      case SeasideGameStates.NextPlayer:
        this.updateActionButtonsNextPlayer(args);
        break;
      case SeasideGameStates.FlipBeach:
        this.updateActionButtonsFlipBeach(args);
        break;
      case SeasideGameStates.StealCrab:
        this.updateActionButtonsStealCrab(args);
        break;
      case SeasideGameStates.SelectIsopods:
        this.updateActionButtonsSelectIsopods(args);
        break;
    }
  }

  updateActionButtonsPlayToken(args: SeasidePlayTokenArgs) {
    if (this.isCurrentPlayerActive()) {
      this.statusBar.addActionButton(`Play ${args.token.activeType} Side`, () =>
        this.actPlayToken(args.token, args.token.activeType)
      );
      this.statusBar.addActionButton(
        `Play ${args.token.inactiveType} Side`,
        () => this.actPlayToken(args.token, args.token.inactiveType)
      );
    }
  }

  updateActionButtonsNextPlayer(args: SeasideNextPlayerArgs) {}

  updateActionButtonsFlipBeach(args: SeasideFlipBeachArgs) {}

  updateActionButtonsStealCrab(args: SeasideStealCrabArgs) {}

  updateActionButtonsSelectIsopods(args: SeasideSelectIsopodsArgs) {}
}
