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

    function stDrawToken()
    {
        $this->drawRandomToken();
        $this->nfTokenDrawn($this->getTokenInPlay());
        $this->gamestate->nextState(TRANSITION_PLAY_TOKEN);
    }

    function stPlayToken()
    {
        $this->undoSavepoint();
    }

    function triggerPlayAgain(): void
    {
        $this->nfPlayAgain((int)$this->getActivePlayerId());
        $this->gamestate->nextState(TRANSITION_NEXT_DRAW);
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
        $this->updatePlayerScores();
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
        $this->updatePlayerScores();

        // Give some extra time to the active player when he completed an action
        $this->giveExtraTime($playerId);
        $this->activeNextPlayer();
        $this->gameEndOrNextState(function () {
            $this->gamestate->nextState(TRANSITION_NEXT_PLAYER);
        });
    }
}
