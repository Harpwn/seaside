<?php
declare(strict_types=1);

trait DebugUtilsTrait
{
    Use ArgsTrait;
    Use ActionTrait;

    function debugStop($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }

    public function debugLog($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }
        self::notifyAllPlayers('logdummy', clienttranslate('${message} - ${value}'),  ['message' => "debug data: ", 'value' => json_encode($debugData)] );
    }

    function debug_playToEndGame() 
    {
        while (intval($this->gamestate->state_id()) < GAME_STATE_END_GAME) {
            $state = intval($this->gamestate->state_id());
            switch ($state) {
                case GAME_STATE_PLAYER_PLAY_TOKEN:
                    $args = $this->argPlayToken();
                    $rand = rand(1,2);
                    $this->actPlayToken($args['token']->id, $rand == 1 ? $args['token']->activeType : $args['token']->inactiveType);
                    break;
                case GAME_STATE_PLAYER_ROCK_STEAL_CRAB:
                    $args = $this->argStealCrab();
                    $playersWithCrabsIds = $args['playersWithCrabsIds'];
                    $rand = rand(0, count($playersWithCrabsIds) - 1);
                    $this->dump('crabs', (int)$playersWithCrabsIds[$rand]);
                    $this->actStealCrab((int)$playersWithCrabsIds[$rand]);
                    break;
                case GAME_STATE_PLAYER_WAVE_FLIP_BEACH:
                    $args = $this->argFlipBeach();
                    $flippableBeachIds = $args['flippableBeachIds'];
                    $rand = rand(0, count($flippableBeachIds) - 1);
                    $this->actFlipBeach($flippableBeachIds[$rand]);
                    break;
                case GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS:
                    $args = $this->argSelectIsopods();
                    $selectableIsopodIds = $args['selectableIsopodIds'];
                    $numberToSelect = rand(0, count($selectableIsopodIds));
                    $selectedIsopodIds = array_slice($selectableIsopodIds, 0, $numberToSelect);
                    $this->actSelectIsopods(implode(',', $selectedIsopodIds));
                    break;
            }
        }
    }

    public function debug_goToState(int $state = 3) {
        $this->gamestate->jumpToState($state);
    }
}