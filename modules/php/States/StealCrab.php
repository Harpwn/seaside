<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Seaside\Game;

class StealCrab extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_PLAYER_ROCK_STEAL_CRAB,
            type: StateType::ACTIVE_PLAYER,
            name: 'stealCrab',
            description: clienttranslate('${actplayer} must steal a crab from another player'),
            descriptionMyTurn: clienttranslate('${you} must steal a crab from another player'),
            transitions: [
                TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
                TRANSITION_UNDO => GAME_STATE_PLAYER_PLAY_TOKEN,
            ],
        );
    }

    public function getArgs(int $activePlayerId): array
    {
        $playersWithCrabs = [];
        foreach ($this->game->getPlayersIds() as $playerId) {
            if ($activePlayerId != $playerId) {
                $crabs = $this->game->getAllTokensOfTypeForLocation((string)$playerId, CRAB);
                if (count($crabs) > 0) {
                    $playersWithCrabs[] = ['id' => (int)$playerId, 'name' => $this->game->getPlayerNameById($playerId)];
                }
            }
        }
        return [
            'playersWithCrabs' => $playersWithCrabs,
        ];
    }

    #[PossibleAction]
    public function actStealCrab(int $victimId, int $activePlayerId, array $args): string
    {
        if (!in_array($victimId, array_column($args['playersWithCrabs'], 'id'))) {
            throw new \BgaUserException("Invalid Victim ID: {$victimId}");
        }

        $crabs = $this->game->getAllTokensOfTypeForLocation((string)$victimId, CRAB);
        $this->game->sendTokenToPlayerArea($crabs[0], $activePlayerId);
        $this->nfCrabStolen($victimId, $activePlayerId, $crabs[0]);
        $this->game->incStat(1, STAT_NO_CRAB, $activePlayerId);
        $this->game->incStat(-1, STAT_NO_CRAB, $victimId);
        return TRANSITION_END_TURN;
    }

    #[PossibleAction]
    public function actUndo(int $activePlayerId): string
    {
        $this->game->undoRestorePoint();
        return TRANSITION_UNDO;
    }

    public function zombie(int $playerId): string
    {
        $args = $this->getArgs($playerId);
        if (!empty($args['playersWithCrabs'])) {
            return $this->actStealCrab($args['playersWithCrabs'][0]['id'], $playerId, $args);
        }
        return TRANSITION_END_TURN;
    }

    private function nfCrabStolen(int $playerId, int $thiefId, \Token $token): void
    {
        $this->game->notify->all("crabStolen", clienttranslate('🏴‍☠️ One of ${player_name}\'s ${crabEmoji} CRAB tokens is stolen'), [
            "player_id" => $playerId,
            "token" => $token,
            "thiefId" => $thiefId,
            "crabEmoji" => $this->game->getEmojiForType('CRAB')
        ]);
    }
}
