<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

/**
 * Shared token-play dispatch logic used by PlayToken, FlipBeach, and SelectIsopods states.
 *
 * Classes using this trait must have a `$this->game` property of type \Bga\Games\Seaside\Game.
 */
trait TokenPlayMixin
{
    protected function playToken(\Token $token, int $playerId, bool $flip = false): string
    {
        if ($flip) {
            $this->game->flipToken($token);
            $token = $this->game->getToken($token->id);
        }

        $this->nfTokenPlayed($playerId, $token);

        return match ($token->activeType) {
            BEACH => $this->handlePlayBeachToken($playerId, $token),
            SANDPIPER => $this->handlePlaySandpiperToken($playerId, $token),
            ISOPOD => $this->handlePlayIsopodToken($token),
            CRAB => $this->handlePlayCrabToken($token),
            ROCK => $this->handlePlayRockToken($playerId, $token),
            SHELL => $this->handlePlayShellToken($token),
            WAVE => $this->handlePlayWaveToken($playerId, $token),
            default => throw new \BgaSystemException("Unknown token type: {$token->activeType}"),
        };
    }

    private function handlePlayBeachToken(int $playerId, \Token $token): string
    {
        $this->game->sendTokenToPlayerArea($token, $playerId);
        $this->nfTokenToPlayerArea($playerId, $token);
        $this->game->incStat(1, STAT_NO_BEACH, $playerId);

        $playerBeachesCount = count($this->game->getAllTokensOfTypeForLocation((string)$playerId, BEACH));
        $seaShells = $this->game->getAllTokensOfTypeForLocation(SEA_LOCATION, SHELL);
        $seaShellsCount = count($seaShells);

        $shellsToMoveCount = min($playerBeachesCount, $seaShellsCount);
        if ($shellsToMoveCount > 0) {
            $shellsToMove = array_slice($seaShells, 0, $shellsToMoveCount);
            $this->game->sendTokensToPlayerArea($shellsToMove, $playerId);
            $this->nfBeachGetsShells($playerId, $shellsToMove);
            $this->game->incStat($shellsToMoveCount, STAT_NO_SHELL, $playerId);
        }
        return TRANSITION_END_TURN;
    }

    private function handlePlaySandpiperToken(int $playerId, \Token $sandpiper): string
    {
        $this->game->sendTokenToPlayArea($sandpiper);

        $availIsopods = array_column($this->game->getAllTokensOfTypeForLocation(SEA_LOCATION, ISOPOD), 'id');
        if (count($availIsopods) > 0) {
            return TRANSITION_SELECT_ISOPODS;
        } else {
            return $this->handleSelectIsopods($playerId, $sandpiper, []);
        }
    }

    private function handlePlayIsopodToken(\Token $isopod): string
    {
        $this->game->sendTokenToSea($isopod);
        return TRANSITION_PLAY_AGAIN;
    }

    private function handlePlayCrabToken(\Token $crab): string
    {
        $this->game->sendTokenToSea($crab);
        return TRANSITION_PLAY_AGAIN;
    }

    private function handlePlayRockToken(int $playerId, \Token $rock): string
    {
        $this->game->sendTokenToPlayerArea($rock, $playerId);
        $this->nfTokenToPlayerArea($playerId, $rock);
        $this->game->incStat(1, STAT_NO_ROCK, $playerId);
        $playerRocks = $this->game->getAllTokensOfTypeForLocation((string)$playerId, ROCK);
        if (is_array($playerRocks) && count($playerRocks) % 2 === 0) {
            $seaCrabs = $this->game->getAllTokensOfTypeForLocation(SEA_LOCATION, CRAB);
            $seaCrabsCount = count($seaCrabs);
            if ($seaCrabsCount > 0) {
                $this->game->sendTokensToPlayerArea($seaCrabs, $playerId);
                $this->nfRockGetsCrabs($playerId, $seaCrabs);
                $this->game->incStat($seaCrabsCount, STAT_NO_CRAB, $playerId);
            }

            foreach ($this->game->getPlayersIds() as $otherPlayerId) {
                if ($otherPlayerId != $playerId) {
                    $enemyCrabs = $this->game->getAllTokensOfTypeForLocation((string)$otherPlayerId, CRAB);
                    if (count($enemyCrabs) > 0) {
                        return TRANSITION_STEAL_CRAB;
                    }
                }
            }
        }
        return TRANSITION_END_TURN;
    }

    private function handlePlayShellToken(\Token $shell): string
    {
        $this->game->sendTokenToSea($shell);
        return TRANSITION_PLAY_AGAIN;
    }

    private function handlePlayWaveToken(int $playerId, \Token $wave): string
    {
        $this->game->sendTokenToPlayerArea($wave, $playerId);
        $this->nfTokenToPlayerArea($playerId, $wave);
        $this->game->incStat(1, STAT_NO_WAVE, $playerId);

        $playerBeaches = $this->game->getAllTokensOfTypeForLocation((string)$playerId, BEACH);
        if (count($playerBeaches) !== 0) {
            return TRANSITION_FLIP_BEACH;
        } else {
            return TRANSITION_END_TURN;
        }
    }

    protected function handleSelectIsopods(int $playerId, \Token $sandpiper, array $isopods): string
    {
        $playerSandpipers = $this->game->getAllTokensOfTypeForLocation((string)$playerId, SANDPIPER);
        $newSandpiperPileId = SANDPIPER_PILE_INIT;
        if (count($playerSandpipers) != 0) {
            $newSandpiperPileId = max(array_column($playerSandpipers, 'locationArg')) + 1;
        }

        $tokens = [...$isopods, $sandpiper];
        $tokens = array_map(function ($token) use ($newSandpiperPileId) {
            $token->locationArg = $newSandpiperPileId;
            return $token;
        }, $tokens);
        $this->game->sendTokensToPlayerArea($tokens, $playerId, $newSandpiperPileId);
        $this->nfcreateSandpiperPile($playerId, $tokens);
        $this->game->incStat(1, STAT_NO_SANDPIPER, $playerId);
        $this->game->incStat(count($isopods), STAT_NO_ISOPOD, $playerId);

        $piles = [];
        $piles[$sandpiper->id] = $isopods;
        array_push($piles[$sandpiper->id], $sandpiper);

        $playerSandpipers = $this->game->getAllTokensOfTypeForLocation((string)$playerId, SANDPIPER);
        foreach ($playerSandpipers as $playerSandpiper) {
            if ($playerSandpiper->id !== $sandpiper->id) {
                $sandpiperIsopods = $this->game->getAllTokensOfTypeForLocation((string)$playerId, ISOPOD, $playerSandpiper->locationArg);
                $piles[$playerSandpiper->id] = $sandpiperIsopods;
                array_push($piles[$playerSandpiper->id], $playerSandpiper);
            }
        }

        $highestPileSize = max(array_map('count', $piles));
        $smallerPiles = array_filter($piles, function ($pile) use ($highestPileSize) {
            return count($pile) < $highestPileSize;
        });

        foreach ($smallerPiles as $sandpiperId => $pileTokens) {
            $this->game->sendTokensToDiscard($pileTokens);
            $this->nfSandpiperIsopodsLost($playerId, $pileTokens);
            $this->game->incStat(-1, STAT_NO_SANDPIPER, $playerId);
            $this->game->incStat(count($pileTokens), STAT_NO_ISOPOD, $playerId);
        }

        return TRANSITION_END_TURN;
    }

    private function nfTokenPlayed(int $playerId, \Token $token): void
    {
        $this->game->notify->all("tokenPlayed", clienttranslate('▶️ ${player_name} plays ${tokenSideEmoji} ${tokenSide}'), [
            "player_id" => $playerId,
            "tokenSide" => $token->activeType,
            "tokenSideEmoji" => $this->game->getEmojiForType($token->activeType),
            "token" => $token,
        ]);
    }

    private function nfTokenToPlayerArea(int $playerId, \Token $token, int $tokenLocationArgs = 0): void
    {
        $this->game->notify->all("tokenToPlayerArea", clienttranslate('${tokenSideEmoji} ${tokenSide} played into ${player_name}\'s shore'), [
            "tokenSide" => $token->activeType,
            "tokenSideEmoji" => $this->game->getEmojiForType($token->activeType),
            "token" => $token,
            "player_id" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    private function nfRockGetsCrabs(int $playerId, array $crabs): void
    {
        $this->game->notify->all("rockGetsCrabs", clienttranslate('⬆️ ${player_name}\'s ${rockEmoji} ROCK pair attracts ${tokenCount} ${crabEmoji} CRAB tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($crabs),
            "tokens" => $crabs,
            "rockEmoji" => $this->game->getEmojiForType('ROCK'),
            "crabEmoji" => $this->game->getEmojiForType('CRAB')
        ]);
    }

    private function nfBeachGetsShells(int $playerId, array $seaShells): void
    {
        $this->game->notify->all("beachGetsShells", clienttranslate('⬆️ ${player_name}\'s ${beachEmoji} Beaches find ${tokenCount} buried ${shellEmoji} SHELL tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($seaShells),
            "tokens" => $seaShells,
            "beachEmoji" => $this->game->getEmojiForType('BEACH'),
            "shellEmoji" => $this->game->getEmojiForType('SHELL')
        ]);
    }

    private function nfcreateSandpiperPile(int $playerId, array $tokens): void
    {
        $this->game->notify->all("createSandpiperPile", clienttranslate('⬆️ ${player_name}\'s ${sandpiperEmoji} SANDPIPER grabs a pile of ${tokenCount} tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($tokens),
            "tokens" => $tokens,
            "sandpiperEmoji" => $this->game->getEmojiForType('SANDPIPER')
        ]);
    }

    private function nfSandpiperIsopodsLost(int $playerId, array $pileTokens): void
    {
        $this->game->notify->all("sandpiperIsopodsLost", clienttranslate('🗑️ ${player_name} loses ${sandpiperEmoji} SANDPIPER pile of ${tokenCount} tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($pileTokens),
            "tokens" => $pileTokens,
            "sandpiperEmoji" => $this->game->getEmojiForType('SANDPIPER')
        ]);
    }
}
