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

    public function actPlayToken(int $tokenId, string $tokenType)
    {
        $playerId = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argPlayToken();

        $token = $this->getToken($tokenId);

        //Validation Here
        if ($token->activeType !== $tokenType && $token->inactiveType !== $tokenType) {
            throw new \BgaUserException("Invalid token type: {$tokenType}");
        }

        if ($inputArgs['token']->id != $tokenId) {
            throw new \BgaUserException("Token ID mismatch: expected {$tokenId}, got {$token->id}");
        }

        if ($token->activeType !== $tokenType) {
            $this->playToken($token, $playerId, true);
        } else {
            $this->playToken($token, $playerId);
        }
    }

    public function actStealCrab(int $victimId) 
    {
        $playerId = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argStealCrab();

        //Validation here

        $this->handleStealCrab($playerId, $victimId);
    }

    public function actFlipBeach(int $beachId)
    {
        $playerId = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argFlipBeach();

        $beach = $this->getToken($beachId);

        //Validation here

        $this->handleFlipBeach($playerId, $beach);
    }

    public function actSelectIsopods(string $isopodIds)
    {
        $isopodIds = explode(',', $isopodIds);
        $isopodIds = array_filter($isopodIds, 'strlen');
        $playerId = (int)$this->getActivePlayerId();

        // check input values
        $inputArgs = $this->argSelectIsopods();
        $tokenId = $inputArgs['sandpiperId'];
        $selectableIsopodIds = $inputArgs['selectableIsopodIds'];


        $sandpiper = $this->getToken((int)$tokenId);
        $isopods = $this->getTokens($isopodIds);

        //Validation here
        foreach ($isopodIds as $isopodId) {
            if (!in_array($isopodId, $selectableIsopodIds)) {
                throw new \BgaUserException("Invalid isopod ID: {$isopodId}");
            }
        }

        $this->handleSelectIsopods($playerId, $sandpiper, $isopods);
    }
}
