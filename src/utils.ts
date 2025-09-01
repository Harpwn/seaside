export const drawToken = (token: SeasideToken, gameGui: GameGui) => {
  const tokenEl = document
    .getElementById("seaside-game-area")
    .insertAdjacentElement("beforeend", tokenToNode(token));
  addTokenTooltip(tokenEl, gameGui);
};

export const getTokenElById = (tokenId: number): Element => {
  return document.getElementById(`seaside-token-${tokenId}`);
};

export const flipToken = (tokenEl: Element) => {
  const activeType = tokenEl.getAttribute("data-active-type");
  const inactiveType = tokenEl.getAttribute("data-inactive-type");
  tokenEl.setAttribute("data-active-type", inactiveType);
  tokenEl.setAttribute("data-inactive-type", activeType);
};

export const moveTokenToSea = async (tokenId: number, tokenLocationArgs: number, gameGui: GameGui) => {
  const oldTokenEl = getTokenElById(tokenId);
  updateTokenElLocation(oldTokenEl, "SEA", tokenLocationArgs);
  const seaEl = document.getElementById(`seaside-sea-area-${getTokenActiveType(oldTokenEl)}`);
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  newTokenEl.removeAttribute("style");
  newTokenEl.classList.add("seaside-token-hidden");
  seaEl.insertAdjacentElement("beforeend", newTokenEl);
  await gameGui.bgaPlayDojoAnimation(gameGui.slideToObjectAndDestroy(oldTokenEl, newTokenEl));
  newTokenEl.classList.remove("seaside-token-hidden");
};

export const moveTokenToDiscard = async (tokenId: number, gameGui: GameGui) => {
  const tokenEl = getTokenElById(tokenId);
  const anim = gameGui.fadeOutAndDestroy(tokenEl);
  await gameGui.bgaPlayDojoAnimation(anim);
};

export const moveTokenToPlayerArea = async (
  playerId: string,
  tokenId: number,
  tokenLocationArgs: number,
  gameGui: GameGui
) => {
  const oldTokenEl = getTokenElById(tokenId);
  const type = getTokenActiveType(oldTokenEl);
  updateTokenElLocation(oldTokenEl, playerId, tokenLocationArgs);
  const playerAreaRowEl = document.getElementById(`seaside-player-${playerId}`).getElementsByClassName(`seaside-player-row-${type}`)[0];
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  newTokenEl.removeAttribute("style");
  newTokenEl.classList.add("seaside-token-hidden");
  playerAreaRowEl.insertAdjacentElement("beforeend", newTokenEl);
  await gameGui.bgaPlayDojoAnimation(gameGui.slideToObjectAndDestroy(oldTokenEl, newTokenEl));
  newTokenEl.classList.remove("seaside-token-hidden");
};

export const createTokenInSea = (token: SeasideToken, gameGui: GameGui) => {
  const seaEl = document.getElementById(`seaside-sea-area-${token.activeType}`);
  const tokenEl = tokenToNode(token);

  seaEl.insertAdjacentElement("beforeend", tokenEl);
};

export const tokenToNode = (token: SeasideToken): Element => {
  const tokenEl = document.createElement("div");
  tokenEl.id = `seaside-token-${token.id}`;
  tokenEl.className = "seaside-token";
  tokenEl.setAttribute("data-id", token.id.toString());
  tokenEl.setAttribute("data-active-type", token.activeType);
  tokenEl.setAttribute("data-inactive-type", token.inactiveType);
  tokenEl.setAttribute("data-location", token.location);
  tokenEl.setAttribute("data-location-arg", token.locationArg);
  return tokenEl;
};

export const clearMoves = () => {
  const possibleMoveEls = document.querySelectorAll(".possible-move");
  possibleMoveEls.forEach((el) => {
    el.classList.remove("possible-move");
    removeAllClickEvents(el);
  });
  const selectedMoveEls = document.querySelectorAll(".selected-move");
  selectedMoveEls.forEach((el) => {
    el.classList.remove("selected-move");
    removeAllClickEvents(el);
  });
};

export const selectSinglePlayer = (playerId: number) => {
  const playerPanel = document.getElementById(`seaside-player-${playerId}`);
  playerPanel.classList.add("selected-move");
  const newEl = removeAllClickEvents(playerPanel);
  newEl.addEventListener("click", () => deselectSinglePlayer(playerId));
  const otherSelectedPlayerPanels = document.querySelectorAll(".selected-move");
  otherSelectedPlayerPanels.forEach((panel) => {
    if (panel !== newEl) {
      panel.classList.remove("selected-move");
      const newOtherPlanel = removeAllClickEvents(panel);
      const otherPlayerId = newOtherPlanel.getAttribute("data-player-id")
      newOtherPlanel.addEventListener("click", () => selectSinglePlayer(parseInt(otherPlayerId)));
    }
  });
  updateConfirmDisabled(false);
};

export const deselectSinglePlayer = (playerId: number) => {
  const playerPanel = document.getElementById(`seaside-player-${playerId}`);
  playerPanel.classList.remove("selected-move");
  const newEl = removeAllClickEvents(playerPanel);
  newEl.addEventListener("click", () => selectSinglePlayer(playerId));
  updateConfirmDisabled(true);
};

export const selectMultipleToken = (tokenId: number) => {
  const tokenEl = getTokenElById(tokenId);
  tokenEl.classList.add("selected-move");
  const newEl = removeAllClickEvents(tokenEl);
  newEl.addEventListener("click", () => deselectMultipleToken(tokenId));
};

export const deselectMultipleToken = (tokenId: number) => {
  const tokenEl = getTokenElById(tokenId);
  tokenEl.classList.remove("selected-move");
  const newEl = removeAllClickEvents(tokenEl);
  newEl.addEventListener("click", () => selectMultipleToken(tokenId));
};

export const selectSingleToken = (tokenId: number) => {
  const tokenEl = getTokenElById(tokenId);
  tokenEl.classList.add("selected-move");
  const newEl = removeAllClickEvents(tokenEl);
  newEl.addEventListener("click", () => deselectSingleToken(tokenId));
  const otherSelectedTokens = document.querySelectorAll(".selected-move");
  otherSelectedTokens.forEach((token) => {
    if (token !== newEl) {
      token.classList.remove("selected-move");
      const newOtherToken = removeAllClickEvents(token);
      const otherTokenId = getTokenId(newOtherToken);
      newOtherToken.addEventListener("click", () => selectSingleToken(otherTokenId));
    }
  });
  updateConfirmDisabled(false);
};

export const deselectSingleToken = (tokenId: number) => {
  const tokenEl = getTokenElById(tokenId);
  tokenEl.classList.remove("selected-move");
  const newEl = removeAllClickEvents(tokenEl);
  newEl.addEventListener("click", () => selectSingleToken(tokenId));
  updateConfirmDisabled(true);
};

export const removeAllClickEvents = (element: Element) => {
  const clone = element.cloneNode(true) as Element; // Deep clone the element
  element.parentNode.replaceChild(clone, element); // Replace the original with the clone
  return clone;
};

export const updateConfirmDisabled = (disabled: boolean) => {
  const confirmButton = document.getElementById("seaside-confirm");
  if (confirmButton) {
    confirmButton.classList.toggle("disabled", disabled);
    confirmButton.removeAttribute("disabled");
    confirmButton.setAttribute("aria-disabled", String(disabled));
  }
};

export const updateTokenElLocation = (element: Element, location: string, locationArg: number) => {
  element.setAttribute("data-location", location);
  element.setAttribute("data-location-arg", locationArg.toString());
}

export const addTokenTooltip = (tokenEl: Element, gameGui: GameGui) => {
  const activeType = tokenEl.getAttribute("data-active-type");
  const inactiveType = tokenEl.getAttribute("data-inactive-type");
  gameGui.addTooltip(tokenEl.id, "Sides - " + activeType + " / " + inactiveType, "");
};

export const getTokenId = (tokenEl: Element): number => {
  return parseInt(tokenEl.getAttribute("data-id"));
};

export const getTokenActiveType = (tokenEl: Element): string => {
  return tokenEl.getAttribute("data-active-type");
};