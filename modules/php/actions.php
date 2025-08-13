<?php
declare(strict_types=1);

require_once('utils.php');
require_once('args.php');
require_once('logic.php');
require_once('notifications.php');

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

        $token = new Token($this->token->getCard($token_id));

        //Validation Here

        $this->playToken($token, $player_id, $flipped);
    }

    public function actStealCrab() 
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argStealCrab();
        $victim_id = $args['victim_id'];

        //Validation here

        $this->handleStealCrab($player_id, $victim_id);
    }

    public function actFlipBeach()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argFlipBeach();

        $token_id = $args['beach_id'];
        $beach = new Token($this->token->getCard($token_id));

        //Validation here

        $this->handleFlipBeach($player_id, $beach);
    }

    public function actSelectIsopods()
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $args = $this->argSelectIsopods();
        $token_id = $args['sandpiper_id'];
        $isopod_ids = $args['isopod_ids'];

        $sandpiper = new Token($this->token->getCard($token_id));

        $isopods = $this->tokens->getCards($isopod_ids);

        //Validation here

        $this->handleSelectIsopods($player_id, $sandpiper, $isopods);
    }
}
