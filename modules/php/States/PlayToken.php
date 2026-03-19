<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Seaside\Game;

class PlayToken extends GameState
{
    use TokenPlayMixin;

    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_PLAYER_PLAY_TOKEN,
            type: StateType::ACTIVE_PLAYER,
            name: 'playToken',
            description: clienttranslate('${actplayer} must choose a side to play'),
            descriptionMyTurn: clienttranslate('${you} must choose a side to play'),
            transitions: [
                TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
                TRANSITION_PLAY_AGAIN => GAME_STATE_PLAYER_PLAY_AGAIN,
                TRANSITION_STEAL_CRAB => GAME_STATE_PLAYER_ROCK_STEAL_CRAB,
                TRANSITION_FLIP_BEACH => GAME_STATE_PLAYER_WAVE_FLIP_BEACH,
                TRANSITION_SELECT_ISOPODS => GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS,
            ],
        );
    }

    public function onEnteringState(int $activePlayerId): void
    {
        $this->game->undoSavepoint();
    }

    public function getArgs(int $activePlayerId): array
    {
        $isopodTokens = $this->game->getAllTokensOfTypeForLocation((string)$activePlayerId, ISOPOD);
        $currentPileSizes = [];
        foreach ($isopodTokens as $token) {
            $locationArg = $token->locationArg;
            if (!isset($currentPileSizes[$locationArg])) {
                $currentPileSizes[$locationArg] = 1;
            }
            $currentPileSizes[$locationArg]++;
        }

        return [
            'token' => $this->game->getTokenInPlay(),
            'currentPileSizes' => array_values($currentPileSizes),
            'selectableIsopods' => $this->game->getAllTokensOfTypeForLocation(SEA_LOCATION, ISOPOD),
            'gameProgression' => $this->game->getGameProgression(),
        ];
    }

    #[PossibleAction]
    public function actPlayToken(int $tokenId, string $tokenType, int $activePlayerId, array $args): string
    {
        $token = $this->game->getToken($tokenId);

        if ($token->side1 !== $tokenType && $token->side2 !== $tokenType) {
            throw new \BgaUserException("Invalid token type: {$tokenType}");
        }

        if ($args['token']->id != $tokenId) {
            throw new \BgaUserException("Token ID mismatch: expected {$tokenId}, got {$args['token']->id}");
        }

        if ($token->activeType !== $tokenType) {
            return $this->playToken($token, $activePlayerId, true);
        } else {
            return $this->playToken($token, $activePlayerId);
        }
    }

    public function zombie(int $playerId): string
    {
        $token = $this->game->getTokenInPlay();
        if ($token === null) {
            return TRANSITION_END_TURN;
        }
        return $this->playToken($token, $playerId);
    }
}

