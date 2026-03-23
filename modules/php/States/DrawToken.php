<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Seaside\Game;
use Bga\Games\Seaside\Token;

class DrawToken extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_GAME_DRAW_TOKEN,
            type: StateType::GAME,
            name: 'drawToken',
        );
    }

    public function onEnteringState(): string
    {
        $this->game->drawRandomToken();
        $this->nfTokenDrawn($this->game->getTokenInPlay());
        return PlayToken::class;
    }

    private function nfTokenDrawn(Token $token): void
    {
        $this->game->notify->all("tokenDrawn", clienttranslate('🆕 A new ${tokenSide1Emoji}/${tokenSide2Emoji} ${tokenSide1Type}/${tokenSide2Type} token is drawn'), [
            'i18n' => ['tokenSide1Type', 'tokenSide2Type'],
            "token" => $token,
            "tokenSide1Type" => $token->side1,
            "tokenSide1Emoji" => $this->game->getEmojiForType($token->side1),
            "tokenSide2Type" => $token->side2,
            "tokenSide2Emoji" => $this->game->getEmojiForType($token->side2)
        ]);
    }
}
