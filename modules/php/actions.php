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

    public function actPlayToken(int $token_id, string $token_type)
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argPlayToken();

        $token = $this->getToken($token_id);

        //Validation Here
        if ($token->activeType !== $token_type && $token->inactiveType !== $token_type) {
            throw new \BgaUserException("Invalid token type: {$token_type}");
        }

        if ($inputArgs['token']->id !== $token_id) {
            throw new \BgaUserException("Token ID mismatch: expected {$token_id}, got {$token->id}");
        }

        if ($token->activeType !== $token_type) {
            $this->playToken($token, $player_id, true);
        } else {
            $this->playToken($token, $player_id);
        }
    }

    public function actStealCrab(int $victim_id) 
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argStealCrab();

        //Validation here

        $this->handleStealCrab($player_id, $victim_id);
    }

    public function actFlipBeach(int $beach_id)
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argFlipBeach();

        $beach = $this->getToken($beach_id);

        //Validation here

        $this->handleFlipBeach($player_id, $beach);
    }

    public function actSelectIsopods(array $isopod_ids)
    {
        $player_id = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argSelectIsopods();
        $token_id = $inputArgs['sandpiper_id'];

        $sandpiper = $this->getToken($token_id);

        $isopods = $this->tokens->getCards($isopod_ids);

        //Validation here

        $this->handleSelectIsopods($player_id, $sandpiper, $isopods);
    }
}
