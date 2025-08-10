// @ts-ignore
GameGui = (function () {
  // this hack required so we fake extend GameGui
  function GameGui() {}
  return GameGui;
})();

// Note: it does not really extend it in es6 way, you cannot call super you have to use dojo way
class Seaside extends GameGui<SeasideGamedatas> {
  constructor() {
    super();
  }

  public setup(gamedatas: SeasideGamedatas) {
    console.log("Starting game setup");
    console.log("gamedatas", gamedatas);

    // Example to add a div on the game area
    this.getGameAreaElement().insertAdjacentHTML(
      "beforeend",
      `<div id="seaside-game-area">
      </div>`
    );

    //Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  public onEnteringState(stateName: string, args: any) {
    console.log("Entering state: " + stateName, args);
    switch (stateName) {
      case "playerTurn":
        break;

      case "endGame":
        break;
    }
  }

  public onLeavingState(stateName: string) {
    console.log("Leaving state: " + stateName);
    switch (stateName) {
      case "playerTurn":
        break;

      case "endGame":
        break;
    }
  }

  public onUpdateActionButtons(stateName: string, args: any) {

  }

  public setupNotifications() {
    console.log("notifications subscriptions setup");
    this.bgaSetupPromiseNotifications();
  }


}
