<?php

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait ActionTrait
{
    use UtilsTrait;
    use NotificationsTrait;
    use ArgsTrait;
    use LogicTrait;

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */
    public function actPlayToken()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argPlayerTurn();

        $token_id = $args['token_id'];
        $flipped = $args['flipped'];

        $token = new Token($this->token->getCard($token_id, $flipped));

        $this->nfTokenPlayed($player_id, $token);

        $this->playToken($token, $player_id);

        // at the end of the action, move to the next state
        $this->gamestate->nextState("playToken");
    }

    function playToken(Token $token, int $player_id): void
    {
        switch ($token->getSide()) {
            case BEACH:
                $this->handlePlayBeachToken($player_id, $token);
                break;
            case SANDPIPER:
                $this->handlePlaySandpiperToken($player_id, $token);
                break;
            case ISOPOD:
                $this->handlePlayIsopodToken($player_id, $token);
                break;
            case CRAB:
                $this->handlePlayCrabToken($player_id, $token);
                break;
            case ROCK:
                $this->handlePlayRockToken($player_id, $token);
                break;
            case SHELL:
                $this->handlePlayShellToken($player_id, $token);
                break;
            case WAVE:
                $this->handlePlayWaveToken($player_id, $token);
                break;
        }
    }
}
