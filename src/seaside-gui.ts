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
    this.tokens.clearSelectedTokens();
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
