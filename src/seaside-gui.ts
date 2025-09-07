import { SeasideActions } from "./seaside-actions";
import { SeasideSetup } from "./seaside-setup";
import { SeasideStateManager } from "./seaside-state";
import { TokenManager } from "./seaside-tokens";

export class SeasideGameGui extends GameGui<SeasideGamedatas> {
  public animationManager;
  public tokens: TokenManager;
  public setups: SeasideSetup;
  public states: SeasideStateManager;
  public actions: SeasideActions;
  public zoom: ZoomManager

  public clearMoves() {
    const possibleMoveEls = document.querySelectorAll('.' +this.tokens.getSelectableCardClass());
    possibleMoveEls.forEach((el) => {
      el.classList.remove(this.tokens.getSelectableCardClass());
      this.removeAllClickEvents(el);
    });
    const selectedMoveEls = document.querySelectorAll('.' +this.tokens.getSelectedCardClass());
    selectedMoveEls.forEach((el) => {
      el.classList.remove(this.tokens.getSelectedCardClass());
      this.removeAllClickEvents(el);
    });
  }

  public selectSinglePlayer(playerId: number) {
    const playerPanel = document.getElementById(`seaside-player-${playerId}`);
    playerPanel.classList.add("selected-move");
    const newEl = this.removeAllClickEvents(playerPanel);
    newEl.addEventListener("click", () => this.deselectSinglePlayer(playerId));
    const otherSelectedPlayerPanels =
      document.querySelectorAll(".selected-move");
    otherSelectedPlayerPanels.forEach((panel) => {
      if (panel !== newEl) {
        panel.classList.remove("selected-move");
        const newOtherPlanel = this.removeAllClickEvents(panel);
        const otherPlayerId = newOtherPlanel.getAttribute("data-player-id");
        newOtherPlanel.addEventListener("click", () =>
          this.selectSinglePlayer(parseInt(otherPlayerId))
        );
      }
    });
    this.updateConfirmDisabled(false);
  }

  public deselectSinglePlayer(playerId: number) {
    const playerPanel = document.getElementById(`seaside-player-${playerId}`);
    playerPanel.classList.remove("selected-move");
    const newEl = this.removeAllClickEvents(playerPanel);
    newEl.addEventListener("click", () => this.selectSinglePlayer(playerId));
    this.updateConfirmDisabled(true);
  }

  public removeAllClickEvents(element: Element) {
    const clone = element.cloneNode(true) as Element; // Deep clone the element
    element.parentNode.replaceChild(clone, element); // Replace the original with the clone
    return clone;
  }

  public updateConfirmDisabled(disabled: boolean) {
    const confirmButton = document.getElementById("seaside-confirm");
    if (confirmButton) {
      confirmButton.classList.toggle("disabled", disabled);
      confirmButton.removeAttribute("disabled");
      confirmButton.setAttribute("aria-disabled", String(disabled));
    }
  }

  public setTooltip(id: string, html: string) {
    this.addTooltipHtml(id, html);
  }
}
