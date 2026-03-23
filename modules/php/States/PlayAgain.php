<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Seaside\Game;

class PlayAgain extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_PLAYER_PLAY_AGAIN,
            type: StateType::ACTIVE_PLAYER,
            name: 'playAgain',
            description: clienttranslate('${actplayer} must play again'),
            descriptionMyTurn: clienttranslate('${you} must play again'),

        );
    }

    public function onEnteringState(int $activePlayerId): string
    {
        $this->game->giveExtraTime($activePlayerId);
        return $this->game->gameEndOrNextState(function () use ($activePlayerId) {
            $this->nfPlayAgain($activePlayerId);
            return DrawToken::class;
        });
    }

    public function zombie(int $playerId): string
    {
        return $this->game->gameEndOrNextState(function () use ($playerId) {
            $this->nfPlayAgain($playerId);
            return DrawToken::class;
        });
    }

    private function nfPlayAgain(int $playerId): void
    {
        $this->game->notify->all("playAgain", clienttranslate('🔄 ${player_name} must play again'), [
            "player_id" => $playerId
        ]);
    }
}
