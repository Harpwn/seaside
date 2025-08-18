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

    function playToken(Token $token, int $player_id, bool $flip = false): void
    {
        if($flip)
        {
            $this->flipToken($token);
            $token = $this->getToken($token->id);
        }

        $this->nfTokenPlayed($player_id, $token);

        switch ($token->activeType) {
            case BEACH:
                $this->handlePlayBeachToken($player_id, $token);
                break;
            case SANDPIPER:
                $this->handlePlaySandpiperToken($player_id, $token);
                break;
            case ISOPOD:
                $this->handlePlayIsopodToken($token);
                break;
            case CRAB:
                $this->handlePlayCrabToken($token);
                break;
            case ROCK:
                $this->handlePlayRockToken($player_id, $token);
                break;
            case SHELL:
                $this->handlePlayShellToken($token);
                break;
            case WAVE:
                $this->handlePlayWaveToken($player_id, $token);
                break;
        }
    }

    function handlePlayBeachToken(int $player_id, Token $token)
    {
        //Send token to player area
        $this->sendTokenToPlayerArea($token, $player_id);

        //check how many beaches the player has
        $playerBeachesCount = count($this->getAllTokensOfTypeForLocation((string)$player_id, BEACH));

        //check how many shells there are in the sea
        $seaShells = $this->getAllTokensOfTypeForLocation(SEA_LOCATION, SHELL);
        $seaShellsCount = count($seaShells);

        //move maximum number of shells to player area
        $shellsToMoveCount = min($playerBeachesCount, $seaShellsCount);
        $shellsToMove = array_slice($seaShells, 0, $shellsToMoveCount);
        $this->sendTokensToPlayerArea($shellsToMove, $player_id);

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handlePlaySandpiperToken(int $player_id, Token $sandpiper)
    {
        $playerSandpipers = $this->getAllTokensOfTypeForLocation((string)$player_id, SANDPIPER);
        if (count($playerSandpipers) === 0) {
            $this->sendTokenToPlayerArea($sandpiper, $player_id, SANDPIPER_PILE_INIT);
        }
        $newSandpiperPileId = max(array_column($playerSandpipers, 'location_arg')) + 1;
        //Send token to player area
        $this->sendTokenToPlayerArea($sandpiper, $player_id, $newSandpiperPileId);

        //prompt player to select isopods
        $this->gamestate->nextState(TRANSITION_SELECT_ISOPODS);
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

    function handlePlayRockToken(int $player_id, Token $rock)
    {
        $playerRocks = $this->getAllTokensOfTypeForLocation((string)$player_id, ROCK);
        if (count($playerRocks) % 2 === 1) {
            //Odd number of rocks, attract crabs

            $newRockPileId = ROCK_PILE_INIT;
            if (count($playerRocks) !== 0) {
                //new pile id to place crabs and rocks
                $newRockPileId = max(array_column($playerRocks, 'location_arg')) + 1;
            }

            //Find rock to create pair
            $unPiledRockToken = $this->getAllTokensOfTypeForLocation((string)$player_id, ROCK, 0)[0];

            //Send main rock to player area
            $this->sendTokenToPlayerArea($rock, $player_id, $newRockPileId);
            $this->sendTokenToPlayerArea($unPiledRockToken, $player_id, $newRockPileId);

            //Send all crabs in sea to player area
            $seaCrabs = $this->getAllTokensOfTypeForLocation(SEA_LOCATION, CRAB);
            $this->sendTokensToPlayerArea($seaCrabs, $player_id);

            //Prompt player to steal crabs
            $this->gamestate->nextState(TRANSITION_STEAL_CRAB);
        } else {
            //even number of rocks, crabs not interested
            $this->sendTokenToPlayerArea($rock, $player_id);
            $this->gamestate->nextState(TRANSITION_END_TURN);
        }
    }

    function handlePlayShellToken(Token $shell)
    {
        $this->sendTokenToSea($shell);
        $this->gamestate->nextState(TRANSITION_PLAY_AGAIN);

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handlePlayWaveToken(int $player_id, Token $wave)
    {
        //Send token to player area
        $this->sendTokenToPlayerArea($wave, $player_id);

        //If player has any beaches, ask them if they want to flip one.
        $playerBeaches = $this->getAllTokensOfTypeForLocation((string)$player_id, BEACH);
        if (count($playerBeaches) !== 0) {
            $this->gamestate->nextState(TRANSITION_FLIP_BEACH);
        }
    }

    /**
     * @property Token[] $isopods
     */
    function handleSelectIsopods(int $player_id, Token $sandpiper, array $isopods)
    {
        //Send isopods to player area, pile of current sandpiper
        $this->sendTokensToPlayerArea($isopods, $player_id, $sandpiper->locationArg);

        $piles = [];
        $piles[$sandpiper->id] = array_column($isopods, 'id');

        // Get other piles
        $playerSandpipers = $this->getAllTokensOfTypeForLocation((string)$player_id, SANDPIPER);
        foreach ($playerSandpipers as $playerSandpiper) {
            $sandpiperToken = $this->getToken($playerSandpiper->id);
            if ($sandpiperToken->id !== $sandpiper->id) {
                $sandpiperIsopods = $this->getAllTokensOfTypeForLocation((string)$player_id, ISOPOD, $sandpiper->locationArg);
                $piles[$playerSandpiper->id] = array_column($sandpiperIsopods, 'id');
            }
        }
        //Remove all but the highest pile
        $highestPileSize = max(array_map('count', $piles));
        $smallerPiles = array_filter($piles, function ($pile) use ($highestPileSize) {
            return count($pile) < $highestPileSize;
        });
        foreach ($smallerPiles as $pileTokens) {
            $this->sendTokensToDiscard($pileTokens, $player_id);
        }

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handleStealCrab(int $player_id, int $victim_id)
    {
        //Get all crabs for victim player
        $crabs = $this->getAllTokensOfTypeForLocation((string)$victim_id, CRAB);

        //Send one crab to player board
        $this->sendTokenToPlayerArea($crabs[0], $player_id);

        //End turn
        $this->gamestate->nextState(TRANSITION_END_TURN);
    }

    function handleFlipBeach(int $player_id, Token $beach) {
        //Play it, flipped
        $this->playToken($beach, $player_id, true);
    }

    function sendTokenToSea(Token $token)
    {
        $this->tokens->moveCard($token->id, SEA_LOCATION, 0);
        $this->nfTokenToSea($token);
    }

    function sendTokenToPlayerArea(Token $token, int $player_id, int $pile_id = 0)
    {
        $this->tokens->moveCard($token->id, (string)$player_id, $pile_id);
        $this->nfTokenToPlayerArea($player_id, $token, $pile_id);
    }

    function sendTokensToPlayerArea(array $tokens, int $player_id, int $pile_id = 0)
    {
        $this->tokens->moveCards($tokens, (string)$player_id, $pile_id);
        $this->nfTokensToPlayerArea($player_id, $tokens, $pile_id);
    }

    function sendTokensToDiscard(array $tokens, int $player_id)
    {
        $this->tokens->moveCards($tokens, DISCARD_LOCATION);
        $this->nfTokensToDiscard($player_id, $tokens);
    }

    function flipToken(Token $token)
    {
        $this->dbFlipToken($token);
    }
}