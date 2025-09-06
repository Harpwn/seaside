import { SeasideGame } from "src";

export class TokenManager extends CardManager<SeasideToken> {
  constructor(public game: SeasideGame, private gameData: SeasideGamedatas) {
    super(game, {
      getId: (token) => `seaside-token-${token.id}`,
      cardWidth: 75,
      cardHeight: 75,
      setupBackDiv: (token: SeasideToken, div: HTMLElement) => {
        div.setAttribute("data-inactive-type", token.inactiveType);
      },
      setupFrontDiv: (token: SeasideToken, div: HTMLElement) => {
        div.setAttribute("data-inactive-type", token.inactiveType);
        this.game.setTooltip(div.id, this.getTooltip(token));
      },
    });
  }

  private getTooltip(token: SeasideToken): string {
    return `
        <p><strong>${_("Active Side:")}</strong> ${token.activeType}</p>
        <p><strong>${_("Inactive Side:")}</strong> ${token.inactiveType}</p>
      `;
  }

  getTokenElById(tokenId: number): Element {
    return document.getElementById(`seaside-token-${tokenId}`);
  }

  drawToken(token: SeasideToken) {
    const tokenEl = document
      .getElementById("seaside-game-area")
      .insertAdjacentElement("beforeend", this.tokenToNode(token));
    this.addTokenTooltip(tokenEl);
  }

  flipToken(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    tokenEl.setAttribute("data-active-type", inactiveType);
    tokenEl.setAttribute("data-inactive-type", activeType);
  }

  createTokenInSea(token: SeasideToken) {
    const seaEl = document.getElementById(
      `seaside-sea-area-${token.activeType}`
    );
    const tokenEl = this.tokenToNode(token);

    seaEl.insertAdjacentElement("beforeend", tokenEl);
  }

  tokenToNode(token: SeasideToken): Element {
    const tokenEl = document.createElement("div");
    tokenEl.id = `seaside-token-${token.id}`;
    tokenEl.className = "seaside-token";
    tokenEl.setAttribute("data-id", token.id.toString());
    tokenEl.setAttribute("data-active-type", token.activeType);
    tokenEl.setAttribute("data-inactive-type", token.inactiveType);
    tokenEl.setAttribute("data-location", token.location);
    tokenEl.setAttribute("data-location-arg", token.locationArg);
    return tokenEl;
  }

  selectMultipleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.add("selected-move");
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectMultipleToken(tokenId));
  }

  deselectMultipleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.remove("selected-move");
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectMultipleToken(tokenId));
  }

  selectSingleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.add("selected-move");
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.deselectSingleToken(tokenId));
    const otherSelectedTokens = document.querySelectorAll(".selected-move");
    otherSelectedTokens.forEach((token) => {
      if (token !== newEl) {
        token.classList.remove("selected-move");
        const newOtherToken = this.game.removeAllClickEvents(token);
        const otherTokenId = this.getTokenId(newOtherToken);
        newOtherToken.addEventListener("click", () =>
          this.selectSingleToken(otherTokenId)
        );
      }
    });
    this.game.updateConfirmDisabled(false);
  }

  deselectSingleToken(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    tokenEl.classList.remove("selected-move");
    const newEl = this.game.removeAllClickEvents(tokenEl);
    newEl.addEventListener("click", () => this.selectSingleToken(tokenId));
    this.game.updateConfirmDisabled(true);
  }

  updateTokenElLocation(
    element: Element,
    location: string,
    locationArg: number
  ) {
    element.setAttribute("data-location", location);
    element.setAttribute("data-location-arg", locationArg.toString());
  }

  addTokenTooltip(tokenEl: Element) {
    const activeType = tokenEl.getAttribute("data-active-type");
    const inactiveType = tokenEl.getAttribute("data-inactive-type");
    this.game.addTooltip(
      tokenEl.id,
      "Sides - " + activeType + " / " + inactiveType,
      ""
    );
  }

  getTokenId(tokenEl: Element): number {
    return parseInt(tokenEl.getAttribute("data-id"));
  }

  getTokenActiveType(tokenEl: Element): string {
    return tokenEl.getAttribute("data-active-type");
  }

  async moveTokenToSea(tokenId: number, tokenLocationArgs: number) {
    const oldTokenEl = this.getTokenElById(tokenId);
    this.updateTokenElLocation(oldTokenEl, "SEA", tokenLocationArgs);
    const seaEl = document.getElementById(
      `seaside-sea-area-${this.getTokenActiveType(oldTokenEl)}`
    );
    const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
    newTokenEl.removeAttribute("style");
    newTokenEl.classList.add("seaside-token-hidden");
    seaEl.insertAdjacentElement("beforeend", newTokenEl);
    await this.game.bgaPlayDojoAnimation(
      this.game.slideToObjectAndDestroy(oldTokenEl, newTokenEl)
    );
    newTokenEl.classList.remove("seaside-token-hidden");
  }

  async moveTokenToDiscard(tokenId: number) {
    const tokenEl = this.getTokenElById(tokenId);
    const anim = this.game.fadeOutAndDestroy(tokenEl);
    await this.game.bgaPlayDojoAnimation(anim);
  }

  async moveTokenToPlayerArea(
    playerId: string,
    tokenId: number,
    tokenLocationArgs: number
  ) {
    const oldTokenEl = this.getTokenElById(tokenId);
    const type = this.getTokenActiveType(oldTokenEl);
    this.updateTokenElLocation(oldTokenEl, playerId, tokenLocationArgs);
    const playerAreaRowEl = document
      .getElementById(`seaside-player-${playerId}`)
      .getElementsByClassName(`seaside-player-row-${type}`)[0];
    const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
    newTokenEl.removeAttribute("style");
    newTokenEl.classList.add("seaside-token-hidden");
    playerAreaRowEl.insertAdjacentElement("beforeend", newTokenEl);
    await this.game.bgaPlayDojoAnimation(
      this.game.slideToObjectAndDestroy(oldTokenEl, newTokenEl)
    );
    newTokenEl.classList.remove("seaside-token-hidden");
  }
}