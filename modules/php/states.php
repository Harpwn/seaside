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
        $playerId = (int)$this->getActivePlayerId();
        
        $remainingTokens = $this->tokens->countCardsInLocation(BAG_LOCATION);
        if ($remainingTokens == 0) {
            $this->gamestate->nextState(TRANSITION_GAME_ENDING);
        } else {
            $this->nfPlayAgain((int)$this->getActivePlayerId());
            $this->gamestate->nextState(TRANSITION_PLAY_TOKEN);
        }

        $this->giveExtraTime($playerId);
    }

    function stPreEndGame() 
    {
        $seaTokens = $this->getAllTokensForLocation(SEA_LOCATION);
        if(count($seaTokens) > 0) 
        {
            $this->handleEndGameWaveBonus($seaTokens);
        }

        $this->gamestate->nextState(TRANSITION_SCORING_STARTED);
    }

    function stEndGameScoring()
    {
        $this->gamestate->nextState(TRANSITION_SCORING_FINISHED);
    }

    public function stNextPlayer(): void
    {
        // Retrieve the active player ID.
        $playerId = (int)$this->getActivePlayerId();

        // Give some extra time to the active player when he completed an action
        $this->giveExtraTime($playerId);

        $this->activeNextPlayer();

        

        // Go to another gamestate
        $remainingTokens = $this->tokens->countCardsInLocation(BAG_LOCATION);
        if ($remainingTokens == 0) {
            $this->gamestate->nextState(TRANSITION_GAME_ENDING);
        } else {
            $this->gamestate->nextState(TRANSITION_NEXT_PLAYER);
        }
    }
}
