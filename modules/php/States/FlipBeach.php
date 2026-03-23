<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Seaside\Game;
use Bga\Games\Seaside\Token;

class FlipBeach extends GameState
{
    use TokenPlayMixin;

    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_PLAYER_WAVE_FLIP_BEACH,
            type: StateType::ACTIVE_PLAYER,
            name: 'flipBeach',
            description: clienttranslate('${actplayer} must flip a beach'),
            descriptionMyTurn: clienttranslate('${you} must flip a beach'),

        );
    }

    public function getArgs(int $activePlayerId): array
    {
        return [
            'flippableBeachs' => $this->game->getAllTokensOfTypeForLocation((string)$activePlayerId, BEACH),
        ];
    }

    #[PossibleAction]
    public function actFlipBeach(int $beachId, int $activePlayerId, array $args): string
    {
        if (!in_array($beachId, array_column($args['flippableBeachs'], 'id'))) {
            throw new \BgaSystemException("Invalid Beach ID: {$beachId}");
        }

        $beach = $this->game->getToken($beachId);
        $transition = $this->playToken($beach, $activePlayerId, true);
        $this->nfBeachFlip($activePlayerId, $beach);
        $this->game->incStat(-1, STAT_NO_BEACH, $activePlayerId);
        return $transition;
    }

    #[PossibleAction]
    public function actUndo(int $activePlayerId): string
    {
        $this->game->undoRestorePoint();
        return PlayToken::class;
    }

    public function zombie(int $playerId): string
    {
        $args = $this->getArgs($playerId);
        if (!empty($args['flippableBeachs'])) {
            $beach = $this->game->getToken($args['flippableBeachs'][0]->id);
            $transition = $this->playToken($beach, $playerId, true);
            $this->nfBeachFlip($playerId, $beach);
            $this->game->incStat(-1, STAT_NO_BEACH, $playerId);
            return $transition;
        }
        return NextPlayer::class;
    }

    private function nfBeachFlip(int $playerId, Token $beach): void
    {
        $this->game->notify->all("beachFlip", clienttranslate('🔃 ${player_name}\'s ${waveEmoji} WAVE washes away a ${beachEmoji} BEACH to reveal a ${otherSideEmoji} ${otherSideType} token'), [
            'i18n' => ['otherSideType'],
            "player_id" => $playerId,
            "token" => $beach,
            "otherSideType" => $beach->inactiveType,
            "otherSideEmoji" => $this->game->getEmojiForType($beach->inactiveType),
            "waveEmoji" => $this->game->getEmojiForType('WAVE'),
            "beachEmoji" => $this->game->getEmojiForType('BEACH')
        ]);
    }
}
