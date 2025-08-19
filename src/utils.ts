export const drawToken = (token: SeasideToken) => {
  document.getElementById("seaside-draw-bag").insertAdjacentHTML(
    "beforeend",
    `
        <div class="seaside-tile" data-id="${token.id}" data-active-type="${token.activeType}" data-inactive-type="${token.inactiveType}" />
      `
  );
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
