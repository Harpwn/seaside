export const drawToken = (token: SeasideToken, gameGui: GameGui) => {
  const tokenEl = document
    .getElementById("seaside-draw-bag")
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
  const seaEl = document.getElementById("seaside-sea-tokens");
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  newTokenEl.removeAttribute("style");
  seaEl.insertAdjacentElement("beforeend", newTokenEl);
  const coords = getRandomPosition();
  gameGui.placeOnObjectPos(newTokenEl, seaEl, coords.x, coords.y);
  const anim = gameGui.slideToObjectAndDestroy(oldTokenEl, newTokenEl);
  await gameGui.bgaPlayDojoAnimation(anim);
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
  updateTokenElLocation(oldTokenEl, playerId, tokenLocationArgs);
  const playerAreaEl = document.getElementById(`seaside-player-${playerId}`);
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  newTokenEl.removeAttribute("style");
  playerAreaEl.insertAdjacentElement("beforeend", newTokenEl);
  const anim = gameGui.slideToObjectAndDestroy(oldTokenEl, newTokenEl);
  await gameGui.bgaPlayDojoAnimation(anim);
};

export const createTokenInSea = (token: SeasideToken, gameGui: GameGui) => {
  const seaEl = document.getElementById("seaside-sea-tokens");
  const tokenEl = tokenToNode(token);

  seaEl.insertAdjacentElement("beforeend", tokenEl);
  const coords = getRandomPosition();
  gameGui.placeOnObjectPos(tokenEl, seaEl, coords.x, coords.y);
};

export const getRandomPosition = () => {
  const randomX = -100 + Math.random() * 200; // -100 .. 100
  const randomY = -100 + Math.random() * 200; // -100 .. 100
  return { x: randomX, y: randomY };
};

export const tokenToNode = (token: SeasideToken): Element => {
  const tokenEl = document.createElement("div");
  tokenEl.id = `seaside-token-${token.id}`;
  tokenEl.className = "seaside-token";
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
      const otherTokenId = newOtherToken.id;
      newOtherToken.addEventListener("click", () => selectSingleToken(parseInt(otherTokenId)));
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