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

export const moveTokenToSea = async (oldTokenEl: Element, gameGui: GameGui) => {
  const seaEl = document.getElementById("seaside-sea-tokens");
  const bagEl = document.getElementById("seaside-draw-bag");
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  seaEl.insertAdjacentElement("beforeend", newTokenEl);

  gameGui.placeOnObject(newTokenEl, bagEl);
  gameGui.fadeOutAndDestroy(oldTokenEl);
  const coords = getRandomPosition();
  const anim = gameGui.slideToObjectPos(newTokenEl, seaEl, coords.x, coords.y);
  await gameGui.bgaPlayDojoAnimation(anim);
};

export const placeTokenInSea = (token: SeasideToken, gameGui: GameGui) => {
  const seaEl = document.getElementById("seaside-sea-tokens");
  const tokenEl = tokenToNode(token);

  seaEl.insertAdjacentElement("beforeend", tokenEl);
  const coords = getRandomPosition();
  gameGui.placeOnObjectPos(tokenEl, seaEl, coords.x, coords.y);
};

export const moveTokenToPlayerArea = async (
  playerId: string,
  oldTokenEl: Element,
  gameGui: GameGui
) => {
  const playerAreaEl = document.getElementById(`seaside-player-${playerId}`);
  const bagEl = document.getElementById("seaside-draw-bag");
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  playerAreaEl.insertAdjacentElement("beforeend", newTokenEl);

  gameGui.placeOnObject(newTokenEl, bagEl);
  gameGui.fadeOutAndDestroy(oldTokenEl);
  const anim = gameGui.slideToObject(newTokenEl, playerAreaEl);
  await gameGui.bgaPlayDojoAnimation(anim);
};

export const moveSeaTokenToPlayerArea = async (
  playerId: string,
  oldTokenEl: Element,
  gameGui: GameGui
) => {
  const playerAreaEl = document.getElementById(`seaside-player-${playerId}`);
  const seaEl = document.getElementById("seaside-sea-tokens");
  const newTokenEl = oldTokenEl.cloneNode(true) as Element; // deep clone
  playerAreaEl.insertAdjacentElement("beforeend", newTokenEl);

  gameGui.placeOnObject(newTokenEl, oldTokenEl);
  gameGui.fadeOutAndDestroy(oldTokenEl);
  const anim = gameGui.slideToObject(newTokenEl, playerAreaEl);
  await gameGui.bgaPlayDojoAnimation(anim);
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
