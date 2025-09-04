import { SeasideGame } from "src";

interface Token {
  id: number;
  activeType: SeasideTokenType;
  inactiveType: SeasideTokenType;
  location: string;
  locationArg: string;
}

export class TokenManager extends BgaCards.Manager<Token> {
  constructor(public game: SeasideGame, private gameData: SeasideGamedatas) {
    super({
      animationManager: game.animationManager,
      type: "seaside-token",
      getId: (token) => `seaside-token-${token.id}`,
      cardWidth: 75,
      cardHeight: 75,
      cardBorderRadius: "50%",
      setupBackDiv: (token: Token, div: HTMLElement) => {
        div.setAttribute("data-inactive-type", token.inactiveType);
      },
      setupFrontDiv: (token: Token, div: HTMLElement) => {
        div.setAttribute("data-inactive-type", token.inactiveType);
        this.game.setTooltip(div.id, this.getTooltip(token));
      },
    });
  }

  private getTooltip(token: Token): string {
      return `
        <p><strong>${_("Active Side:")}</strong> ${token.activeType}</p>
        <p><strong>${_("Inactive Side:")}</strong> ${token.inactiveType}</p>
      `;
  }
}
