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
            throw new \BgaSystemException("Invalid token type: {$tokenType}");
        }

        if ($args['token']->id != $tokenId) {
            throw new \BgaSystemException("Token ID mismatch: expected {$tokenId}, got {$args['token']->id}");
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
            return NextPlayer::class;
        }
        return $this->playToken($token, $playerId);
    }
}

