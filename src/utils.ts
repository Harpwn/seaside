export const drawToken = (token: SeasideToken) => {
  document
    .getElementById("seaside-draw-bag")
    .insertAdjacentElement("beforeend", tokenToNode(token));
};

export const getTokenElById = (tokenId: number): Element => {
  return document.querySelector(`.seaside-tile[data-id="${tokenId}"]`);
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
  tokenEl.className = "seaside-tile";
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

export const selectVictimPlayer = (victimId: number) => {
  const playerPanel = document.getElementById(`seaside-player-${victimId}`);
  playerPanel.classList.add("selected-move");
  const newEl = removeAllClickEvents(playerPanel);
  newEl.addEventListener("click", () => deselectVictimPlayer(victimId));
  const otherSelectedPlayerPanels = document.querySelectorAll(".selected-move");
  otherSelectedPlayerPanels.forEach((panel) => {
    if (panel !== newEl) {
      panel.classList.remove("selected-move");
      const newOtherPlanel = removeAllClickEvents(panel);
      const otherPlayerId = newOtherPlanel.getAttribute("data-player-id")
      newOtherPlanel.addEventListener("click", () => selectVictimPlayer(parseInt(otherPlayerId)));
    }
  });
  updateConfirmDisabled(false);
};

export const deselectVictimPlayer = (victimId: number) => {
  const playerPanel = document.getElementById(`seaside-player-${victimId}`);
  playerPanel.classList.remove("selected-move");
  const newEl = removeAllClickEvents(playerPanel);
  newEl.addEventListener("click", () => selectVictimPlayer(victimId));
  updateConfirmDisabled(true);
};

export const selectToken = (tokenId: number) => {
  const tokenEl = getTokenElById(tokenId);
  tokenEl.classList.add("selected-move");
  const newEl = removeAllClickEvents(tokenEl);
  newEl.addEventListener("click", () => deselectToken(tokenId));
};

export const deselectToken = (tokenId: number) => {
  const tokenEl = getTokenElById(tokenId);
  tokenEl.classList.remove("selected-move");
  const newEl = removeAllClickEvents(tokenEl);
  newEl.addEventListener("click", () => selectToken(tokenId));
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