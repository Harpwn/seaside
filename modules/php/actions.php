<?php

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 * Each time a player is doing some game action, one of the * methods below is called.
 * (note: each method below must match an input method in 
 * nicodemus.action.php)
 */
trait ActionTrait
{
    use UtilsTrait;
    use NotificationsTrait;
    use ArgsTrait;
    use LogicTrait;

    public function actPlayToken()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argPlayToken();

        $token_id = $args['token_id'];
        $flipped = $args['flipped'];

        $token = new Token($this->token->getCard($token_id, $flipped));

        $this->nfTokenPlayed($player_id, $token);

        $this->playToken($token, $player_id);
    }

    public function actStealCrab() 
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argStealCrab();
    }

    public function actFlipBeach()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argFlipBeach();
    }

    public function actSelectIsopods()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argSelectIsopods();
    }
}
