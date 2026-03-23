<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Seaside\Game;

class NextPlayer extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_NEXT_PLAYER,
            type: StateType::GAME,
            name: 'nextPlayer',
            updateGameProgression: true,

        );
    }

    public function onEnteringState(): string
    {
        $playerId = (int)$this->game->getActivePlayerId();
        $this->game->updatePlayerScores();
        $this->game->giveExtraTime($playerId);
        $this->game->activeNextPlayer();
        return $this->game->gameEndOrNextState(fn() => DrawToken::class);
    }
}
