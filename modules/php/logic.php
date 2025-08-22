<?php

declare(strict_types=1);

require_once('utils.php');
require_once('notifications.php');
require_once('db.php');

/**
 * Utilities for token actions.
 * 
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait LogicTrait
{
    use UtilsTrait;
    use NotificationsTrait;
    use DbTrait;

    function playToken(Token $token, int $playerId, bool $flip = false): void
    {
        if ($flip) {
            $this->flipToken($token);
            $token = $this->getToken($token->id);
        }

        $this->nfTokenPlayed($playerId, $token);

        switch ($token->activeType) {
            case BEACH:
                $this->handlePlayBeachToken($playerId, $token);
                break;
            case SANDPIPER:
                $this->handlePlaySandpiperToken($playerId, $token);
                break;
            case ISOPOD:
                $this->handlePlayIsopodToken($token);
                break;
            case CRAB:
                $this->handlePlayCrabToken($token);
                break;
            case ROCK:
                $this->handlePlayRockToken($playerId, $token);
                break;
            case SHELL:
                $this->handlePlayShellToken($token);
                break;
            case WAVE:
                $this->handlePlayWaveToken($playerId, $token);
                break;
        }
    }

    function handlePlayBeachToken(int $playerId, Token $token)
    {
        //Send token to player area
        $this->sendTokenToPlayerArea($token, $playerId);

        //check how many beaches the player has
        $playerBeachesCount = count($this->getAllTokensOfTypeForLocation((string)$playerId, BEACH));

        //check how many shells there are in the sea
        $seaShells = $this->getAllTokensOfTypeForLocation(SEA_LOCATION, SHELL);
        $seaShellsCount = count($seaShells);

        //move maximum number of shells to player area
        $shellsToMoveCount = min($playerBeachesCount, $seaShellsCount);
        if ($shellsToMoveCount > 0) {
            $shellsToMove = array_slice($seaShells, 0, $shellsToMoveCount);
            $this->sendTokensToPlayerArea($shellsToMove, $playerId);
        }

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handlePlaySandpiperToken(int $playerId, Token $sandpiper)
    {
        $this->sendTokenToPlayerArea($sandpiper, $playerId, 0);

        $availIsopods = array_column($this->getAllTokensOfTypeForLocation(SEA_LOCATION, ISOPOD), 'id');
        if(count($availIsopods) > 0) {
            //prompt player to select isopods
            $this->gamestate->nextState(TRANSITION_SELECT_ISOPODS);
        } else {
            $this->handleSelectIsopods($playerId, $sandpiper, []);
        }
    }

    function handlePlayIsopodToken(Token $isopod)
    {
        $this->sendTokenToSea($isopod);
        $this->gamestate->nextState(TRANSITION_PLAY_AGAIN);
    }

    function handlePlayCrabToken(Token $crab)
    {
        $this->sendTokenToSea($crab);
        $this->gamestate->nextState(TRANSITION_PLAY_AGAIN);
    }

    function handlePlayRockToken(int $playerId, Token $rock)
    {
        $playerRocks = $this->getAllTokensOfTypeForLocation((string)$playerId, ROCK);
        if (count($playerRocks) % 2 === 1) {
            //Odd number of rocks, attract crabs

            $newRockPileId = ROCK_PILE_INIT;
            if (count($playerRocks) !== 0) {
                //new pile id to place crabs and rocks
                $newRockPileId = max(array_column($playerRocks, 'locationArg')) + 1;
            }

            //Find rock to create pair
            $unPiledRockToken = $this->getAllTokensOfTypeForLocation((string)$playerId, ROCK, 0)[0];

            //Send main rock to player area
            $this->sendTokenToPlayerArea($rock, $playerId, $newRockPileId);
            $this->sendTokenToPlayerArea($unPiledRockToken, $playerId, $newRockPileId);

            //Send all crabs in sea to player area
            $seaCrabs = $this->getAllTokensOfTypeForLocation(SEA_LOCATION, CRAB);

            if (count($seaCrabs) > 0) {
                $this->sendTokensToPlayerArea($seaCrabs, $playerId);
            }

            //for each player
            foreach ($this->getPlayersIds() as $otherPlayerId) {
                if ($otherPlayerId != $playerId) {
                    $enemyCrabs = $this->getAllTokensOfTypeForLocation((string)$otherPlayerId, CRAB);
                    if (count($enemyCrabs) > 0) {
                        //Enemy has crabs to steal!
                        $this->gamestate->nextState(TRANSITION_STEAL_CRAB);
                        return;
                    }
                }
            }
        } else {
            //crabs not interested
            $this->sendTokenToPlayerArea($rock, $playerId);
        }

        //next player
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handlePlayShellToken(Token $shell)
    {
        $this->sendTokenToSea($shell);
        $this->gamestate->nextState(TRANSITION_PLAY_AGAIN);
    }

    function handlePlayWaveToken(int $playerId, Token $wave)
    {
        //Send token to player area
        $this->sendTokenToPlayerArea($wave, $playerId);

        //If player has any beaches, ask them if they want to flip one.
        $playerBeaches = $this->getAllTokensOfTypeForLocation((string)$playerId, BEACH);
        if (count($playerBeaches) !== 0) {
            $this->gamestate->nextState(TRANSITION_FLIP_BEACH);
        } else {
            //No beaches, just end turn
            $this->gamestate->nextState(TRANSITION_END_TURN);
        }
    }

    /**
     * @property Token[] $isopods
     */
    function handleSelectIsopods(int $playerId, Token $sandpiper, array $isopods)
    {
        $playerSandpipers = $this->getAllTokensOfTypeForLocation((string)$playerId, SANDPIPER);
        $newSandpiperPileId = SANDPIPER_PILE_INIT;
        if (count($playerSandpipers) == 1) {
            $this->sendTokenToPlayerArea($sandpiper, $playerId, $newSandpiperPileId);
        } else {
            $newSandpiperPileId = max(array_column($playerSandpipers, 'locationArg')) + 1;
            $this->sendTokenToPlayerArea($sandpiper, $playerId, $newSandpiperPileId);
        }

        if(count($isopods) > 0) {
            //Send isopods to player area, pile of current sandpiper
            $this->sendTokensToPlayerArea($isopods, $playerId, $newSandpiperPileId);
        }

        $piles = [];
        $piles[$sandpiper->id] = array_column($isopods, 'id');


        // Get other piles
        $playerSandpipers = $this->getAllTokensOfTypeForLocation((string)$playerId, SANDPIPER);
        foreach ($playerSandpipers as $playerSandpiper) {
            if ($playerSandpiper->id !== $sandpiper->id) {
                $sandpiperIsopods = $this->getAllTokensOfTypeForLocation((string)$playerId, ISOPOD, $playerSandpiper->locationArg);
                $piles[$playerSandpiper->id] = array_column($sandpiperIsopods, 'id');
            }
        }

        //Remove all but the highest pile
        $highestPileSize = max(array_map('count', $piles));
        $smallerPiles = array_filter($piles, function ($pile) use ($highestPileSize) {
            return count($pile) < $highestPileSize;
        });

        foreach ($smallerPiles as $sandpiperId => $pileTokens) {
            $this->sendTokensToDiscard([$sandpiperId], $playerId);
            $this->sendTokensToDiscard($pileTokens, $playerId);
        }

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handleStealCrab(int $playerId, int $victimId)
    {
        //Get all crabs for victim player
        $crabs = $this->getAllTokensOfTypeForLocation((string)$victimId, CRAB);

        //Send one crab to player board
        $this->sendTokenToPlayerArea($crabs[0], $playerId);

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handleFlipBeach(int $playerId, Token $beach)
    {
        //Play it, flipped
        $this->playToken($beach, $playerId, true);
    }

    function sendTokenToSea(Token $token)
    {
        $this->tokens->moveCard($token->id, SEA_LOCATION, 0);
        $this->nfTokenToSea($token, 0);
    }

    function sendTokenToPlayerArea(Token $token, int $playerId, int $tokenLocationArgs = 0)
    {
        $this->tokens->moveCard($token->id, (string)$playerId, $tokenLocationArgs);
        $this->nfTokenToPlayerArea($playerId, $token, $tokenLocationArgs);
    }

    function sendTokensToPlayerArea(array $tokens, int $playerId, int $tokenLocationArgs = 0)
    {
        $tokenIds = array_map(function ($token) {
            return $token->id;
        }, $tokens);
        $this->tokens->moveCards($tokenIds, (string)$playerId, $tokenLocationArgs);
        $this->nfTokensToPlayerArea($playerId, $tokens, $tokenLocationArgs);
    }

    function sendTokensToDiscard(array $tokenIds, int $playerId)
    {
        $this->tokens->moveCards($tokenIds, DISCARD_LOCATION);
        $this->nfTokensToDiscard($playerId, $tokenIds);
    }

    function flipToken(Token $token)
    {
        $this->dbFlipToken($token);
    }
}
