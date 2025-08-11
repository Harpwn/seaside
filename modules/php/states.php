<?php

trait StatesTrait
{

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stPlayTokenSide() {}

    function stEndTurn() {}

    public function stNextPlayer(): void
    {
        // Retrieve the active player ID.
        $player_id = (int)$this->getActivePlayerId();

        // Give some extra time to the active player when he completed an action
        $this->giveExtraTime($player_id);

        $this->activeNextPlayer();

        // Go to another gamestate
        $gameEnd = false; // Here, we would detect if the game is over to make the appropriate transition
        if ($gameEnd) {
            $this->gamestate->nextState("endScore");
        } else {
            $this->gamestate->nextState("nextPlayer");
        }
    }

    public function stEndScore(): void
    {
        // Here, we would compute scores if they are not updated live, and compute average statistics

        $this->gamestate->nextState();
    }
}
