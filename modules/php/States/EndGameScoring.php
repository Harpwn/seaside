<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Seaside\Game;

class EndGameScoring extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_END_GAME_SCORING,
            type: StateType::GAME,
            name: 'endGameScoring',
            description: clienttranslate('End of game: final scoring'),

        );
    }

    public function onEnteringState(): string|int
    {
        $this->game->updatePlayerScores();
        $tokensByPlayer = [];
        foreach ($this->game->getPlayersIds() as $playerId) {
            $tokensByPlayer[$playerId] = $this->game->getAllTokensForLocation((string)$playerId);
        }
        $this->nfEndGameScoring($tokensByPlayer);
        return GAME_STATE_END_GAME;
    }

    private function nfEndGameScoring(array $tokensByPlayer): void
    {
        if ($this->game->isSoloGame()) {
            $this->game->notify->all("endGameScoringSolo", clienttranslate('🏆 End game scoring results (solo)'), [
                "tokensByPlayer" => $tokensByPlayer,
                "resultText" => $this->game->getSoloGameResultText()
            ]);
        } else {
            $this->game->notify->all("endGameScoring", clienttranslate('🏆 End game scoring results'), [
                "tokensByPlayer" => $tokensByPlayer
            ]);
        }
    }
}
