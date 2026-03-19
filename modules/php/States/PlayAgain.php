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
            transitions: [
                TRANSITION_NEXT_DRAW => GAME_STATE_GAME_DRAW_TOKEN,
                TRANSITION_GAME_ENDING => GAME_STATE_PRE_END_GAME,
            ],
        );
    }

    public function onEnteringState(int $activePlayerId): string
    {
        $this->game->giveExtraTime($activePlayerId);
        return $this->game->gameEndOrNextState(function () use ($activePlayerId) {
            $this->nfPlayAgain($activePlayerId);
            return TRANSITION_NEXT_DRAW;
        });
    }

    public function zombie(int $playerId): string
    {
        return $this->game->gameEndOrNextState(function () use ($playerId) {
            $this->nfPlayAgain($playerId);
            return TRANSITION_NEXT_DRAW;
        });
    }

    private function nfPlayAgain(int $playerId): void
    {
        $this->game->notify->all("playAgain", clienttranslate('🔄 ${player_name} must play again'), [
            "player_id" => $playerId
        ]);
    }
}
