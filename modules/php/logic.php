<?php

/**
 * Utilities for token actions.
 * 
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait LogicTrait
{
    use UtilsTrait;
    use NotificationsTrait;

    function handlePlayBeachToken(int $player_id, Token $token)
    {
        //Send token to player area
        $this->sendTokenToPlayerArea($token, $player_id);

        //check how many beaches the player has
        $playerBeachesCount = count($this->getAllTokensOfTypeForLocation($player_id, BEACH));

        //check how many shells there are in the sea
        $seaShells = $this->getAllTokensOfTypeForLocation(SEA_LOCATION, SHELL);
        $seaShellsCount = count($seaShells);

        //move maximum number of shells to player area
        $shellsToMoveCount = min($playerBeachesCount, $seaShellsCount);
        $shellsToMove = array_slice($seaShells, 0, $shellsToMoveCount);
        $this->sendTokensToPlayerArea($shellsToMove, $player_id);
    }

    function handlePlaySandpipeToken(int $player_id, Token $token)
    {
        $playerSandpipers = $this->getAllTokensOfTypeForLocation($player_id, SANDPIPER);
        if (count($playerSandpipers) === 0) {
            $this->sendTokenToPlayerArea($token, $player_id, 100);
        }
        $newSandpiperPileId = max(array_column($playerSandpipers, 'location_args')) + 1;
        //Send token to player area
        $this->sendTokenToPlayerArea($token, $player_id);

        //player must select any number of isopods from sea

        //player discards any isopods / sandpiper piles smaller than ths biggest pile
    }

    function handlePlayIsopodToken(int $player_id, Token $token)
    {
        $this->sendTokenToSea($token);
        //player plays again
    }

    function handlePlayCrabToken(int $player_id, Token $token)
    {
        //Crab goes to sea and player plays again
        $this->sendTokenToSea($token);
    }

    function handlePlayRockToken(int $player_id, Token $token)
    {
        $playerRocks = $this->getAllTokensOfTypeForLocation($player_id, ROCK);
        if (count($playerRocks) % 2 === 1) {
            //Odd number of rocks, attract crabs

            //new pile id to place crabs and rocks
            $newRockPileId = max(array_column($playerRocks, 'location_args')) + 1;
            //Find rock to create pair
            $unPiledRockToken = $this->getAllTokensOfTypeForLocation($player_id, ROCK, 0)[0];
            //Send main rock to player area
            $this->sendTokenToPlayerArea($token, $player_id, $newRockPileId);
            $this->sendTokenToPlayerArea($unPiledRockToken, $player_id, $newRockPileId);
            //Send all crabs in sea to new pile
            $seaCrabs = $this->getAllTokensOfTypeForLocation(SEA_LOCATION, CRAB);

            //Prompt player to steal crabs

        } else {
            //even number of rocks, crabs not interested
            $this->sendTokenToPlayerArea($token, $player_id);
        }
    }

    function handlePlayShellToken(int $player_id, Token $token)
    {
        //Shell goes to sea and player plays again
        $this->sendTokenToSea($token);
    }

    function handlePlayWaveToken(int $player_id, Token $token)
    {
        //Send token to player area
        $this->sendTokenToPlayerArea($token, $player_id);

        //If player has any beaches, ask them if they want to flip one.

    }

    function sendTokenToSea(Token $token)
    {
        $this->tokens->moveCard($token->id, SEA_LOCATION, 0);
        $this->nfTokenToSea($token);
    }

    function sendTokenToPlayerArea(Token $token, int $player_id, int $pile_id = 0)
    {
        $this->tokens->moveCard($token->id, $player_id, $pile_id);
        $this->nfTokenToPlayerArea($player_id, $token, $pile_id);
    }

    function sendTokensToPlayerArea(array $tokens, int $player_id, int $pile_id = 0)
    {
        $this->tokens->moveCards($tokens, $player_id, $pile_id);
        $this->nfTokensToPlayerArea($player_id, $tokens, $pile_id);
    }
}
