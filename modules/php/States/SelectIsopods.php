<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Seaside\Game;

class SelectIsopods extends GameState
{
    use TokenPlayMixin;

    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS,
            type: StateType::ACTIVE_PLAYER,
            name: 'selectIsopods',
            description: clienttranslate('${actplayer} may select isopods from the sea'),
            descriptionMyTurn: clienttranslate('${you} may select isopods from the sea'),
            transitions: [
                TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
                TRANSITION_UNDO => GAME_STATE_PLAYER_PLAY_TOKEN,
            ],
        );
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
            'sandpiper' => $this->game->getAllTokensOfTypeForLocation(PLAY_LOCATION, SANDPIPER)[0],
            'selectableIsopods' => $this->game->getAllTokensOfTypeForLocation(SEA_LOCATION, ISOPOD),
            'currentPileSizes' => array_values($currentPileSizes),
        ];
    }

    #[PossibleAction]
    public function actSelectIsopods(string $isopodIds, int $activePlayerId, array $args): string
    {
        $isopodIdList = array_filter(explode(',', $isopodIds), 'strlen');
        $selectableIsopods = $args['selectableIsopods'];

        foreach ($isopodIdList as $id) {
            if (!in_array($id, array_column($selectableIsopods, 'id'))) {
                throw new \BgaUserException("Invalid isopod ID: {$id}");
            }
        }

        $sandpiper = $this->game->getToken((int)$args['sandpiper']->id);
        $isopods = $this->game->getTokens($isopodIdList);

        return $this->handleSelectIsopods($activePlayerId, $sandpiper, $isopods);
    }

    #[PossibleAction]
    public function actUndo(int $activePlayerId): string
    {
        $this->game->undoRestorePoint();
        return TRANSITION_UNDO;
    }

    public function zombie(int $playerId): string
    {
        // Select no isopods
        $args = $this->getArgs($playerId);
        return $this->actSelectIsopods('', $playerId, $args);
    }
}
