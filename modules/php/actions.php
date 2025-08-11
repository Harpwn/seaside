<?php

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait ActionTrait
{

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function actPlayToken()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argPlayerTurn();

        $tokenData = $this->getTokenData($args['Token']['id'], $args['Side']);
        $token = $this->tokens->getCard($args['Token']['id']);

        $this->nfTokenPlayed($player_id, $token);

        // at the end of the action, move to the next state
        $this->gamestate->nextState("playTokenSide");
    }

    function playTokenSide($tokenData, $side, $player_id): void
    {
        switch ($tokenData[$side]) {
            case 'BEACH':
                $this->handlePlayBeachToken($player_id);
                break;
            case 'BIRD':
                $this->handlePlayBirdToken($player_id);
                break;
            case 'BUG':
                $this->handlePlayBugToken($player_id);
                break;
            case 'CRAB':
                $this->handlePlayCrabToken($player_id);
                break;
            case 'ROCK':
                $this->handlePlayRockToken($player_id);
                break;
            case 'SHELL':
                $this->handlePlayShellToken($player_id);
                break;
            case 'WAVE':
                $this->handlePlayWaveToken($player_id);
                break;
        }
    }

    function handlePlayBeachToken($player_id) {}

    function handlePlayBirdToken($player_id) {}

    function handlePlayBugToken($player_id) {}

    function handlePlayCrabToken($player_id) {}

    function handlePlayRockToken($player_id) {}

    function handlePlayShellToken($player_id) {}

    function handlePlayWaveToken($player_id) {}
}
