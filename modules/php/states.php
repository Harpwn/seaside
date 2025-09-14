<?php

declare(strict_types=1);

trait StatesTrait
{

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    function stPlayAgain()
    {
        $this->gameEndOrNextState(function () {
            $this->triggerPlayAgain();
        });
        $this->giveExtraTime((int)$this->getActivePlayerId());
    }

    function triggerPlayAgain(): void
    {
        $this->nfPlayAgain((int)$this->getActivePlayerId());
        $this->gamestate->nextState(TRANSITION_PLAY_TOKEN);
    }

    function stPreEndGame()
    {
        $seaTokens = $this->getAllTokensForLocation(SEA_LOCATION);
        if (count($seaTokens) > 0) {
            $this->handleEndGameWaveBonus($seaTokens);
        }

        $this->gamestate->nextState(TRANSITION_SCORING_STARTED);
    }

    function stEndGameScoring()
    {
        $tokensByPlayer = [];
        foreach ($this->getPlayersIds() as $playerId) {
            $tokensByPlayer[$playerId] = $this->getAllTokensForLocation((string)$playerId);
        }
        $this->nfEndGameScoring($tokensByPlayer);
        $this->gamestate->nextState(TRANSITION_SCORING_FINISHED);
    }

    public function stNextPlayer(): void
    {
        // Retrieve the active player ID.
        $playerId = (int)$this->getActivePlayerId();

        // Give some extra time to the active player when he completed an action
        $this->giveExtraTime($playerId);
        $this->activeNextPlayer();
        $this->gameEndOrNextState(function () {
            $this->gamestate->nextState(TRANSITION_NEXT_PLAYER);
        });
    }

    function gameEndOrNextState(callable $toNextState): void{
        $remainingTokens = $this->tokens->countCardsInLocation(BAG_LOCATION);
        if ($this->isSoloGame()) {
            $gameEnds = $this->soloGameEndConditionMet();
            if ($gameEnds) {
                $this->gamestate->nextState(TRANSITION_GAME_ENDING);
            } else if ($remainingTokens == 0) {
                $this->gamestate->nextState(TRANSITION_GAME_ENDING);
            } else {
                $toNextState();
            }
        } else if ($remainingTokens == 0) {
            $this->gamestate->nextState(TRANSITION_GAME_ENDING);
        } else {
            $toNextState();
        }
    }

    function soloGameEndConditionMet(): bool
    {
        //check if sea has 7 total tokens
        $seaTokens = $this->getAllTokensForLocation(SEA_LOCATION);
        if (count($seaTokens) >= 7) {
            $this->nfSoloTokenLimitReached('Sea');
            return true;
        }

        //check if player has 7 of any non sea-token
        $playerId = (int)$this->getActivePlayerId();
        $playerTokens = $this->getAllTokensForLocation((string)$playerId);
        $filteredTokens = array_filter($playerTokens, function ($token) {
            return $token->activeType !== SHELL && $token->activeType !== ISOPOD && $token->activeType !== CRAB;
        });
        $typeCounts = [];
        foreach ($filteredTokens as $token) {
            if (!array_key_exists($token->activeType, $typeCounts)) {
                $typeCounts[$token->activeType] = 0;
            }
            $typeCounts[$token->activeType]++;
            if ($typeCounts[$token->activeType] >= 7) {
                $this->nfSoloTokenLimitReached($token->activeType);
                return true;
            }
        }

        return false;
    }
}
