<?php

declare(strict_types=1);

trait DebugUtilsTrait
{
    use ArgsTrait;
    use ActionTrait;

    function debugStop($debugData)
    {
        if ($this->getBgaEnvironment() != 'studio') {
            return;
        }
        die('debug data : ' . json_encode($debugData));
    }

    public function debugLog($debugData, $debugMessage)
    {
        if ($this->getBgaEnvironment() != 'studio') {
            return;
        }
        self::notifyAllPlayers('logdummy', clienttranslate('${message} - ${value}'),  ['message' => $debugMessage ?? 'debug data:', 'value' => json_encode($debugData)]);
    }

    function debug_playToEndGame()
    {
        while (intval($this->gamestate->state_id()) < GAME_STATE_END_GAME) {
            $state = intval($this->gamestate->state_id());
            $this->autoplay_state($this->gamestate->state()['name']);
        }
    }

    function debug_playUntilCrabSteal()
    {
        while (intval($this->gamestate->state_id()) != GAME_STATE_PLAYER_ROCK_STEAL_CRAB && intval($this->gamestate->state_id()) < GAME_STATE_END_GAME) {
            $state = intval($this->gamestate->state_id());
            $this->autoplay_state($this->gamestate->state()['name']);
        }
    }

    function debug_playUntilSelectIsopods()
    {
        while (intval($this->gamestate->state_id()) != GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS && intval($this->gamestate->state_id()) < GAME_STATE_END_GAME) {
            $state = intval($this->gamestate->state_id());
            $this->autoplay_state($this->gamestate->state()['name']);
        }
    }

    function debug_playUntilFlipBeach()
    {
        while (intval($this->gamestate->state_id()) != GAME_STATE_PLAYER_WAVE_FLIP_BEACH && intval($this->gamestate->state_id()) < GAME_STATE_END_GAME) {
            $this->autoplay_state($this->gamestate->state()['name']);
        }
    }

    public function debug_goToState(int $state = 3)
    {
        $this->gamestate->jumpToState($state);
    }

    private function autoplay_state(string $state)
    {
        switch ($state) {
            case 'playToken':
                $args = $this->argPlayToken();
                $rand = bga_rand(1, 2);
                $this->actPlayToken($args['token']->id, $rand == 1 ? $args['token']->side1 : $args['token']->side2);
                break;
            case 'stealCrab':
                $args = $this->argStealCrab();
                $playersWithCrabs = $args['playersWithCrabs'];
                $rand = bga_rand(0, count($playersWithCrabs) - 1);
                $this->actStealCrab((int)$playersWithCrabs[$rand]['id']);
                break;
            case 'flipBeach':
                $args = $this->argFlipBeach();
                $flippableBeachs = $args['flippableBeachs'];
                $rand = bga_rand(0, count($flippableBeachs) - 1);
                $this->actFlipBeach($flippableBeachs[$rand]->id);
                break;
            case 'selectIsopods':
                $args = $this->argSelectIsopods();
                $selectableIsopods = $args['selectableIsopods'];
                $numberToSelect = rand(0, count($selectableIsopods));
                $selectedIsopodIds = array_slice(array_column($selectableIsopods, 'id'), 0, $numberToSelect);
                $this->actSelectIsopods(implode(',', $selectedIsopodIds));
                break;
        }
    }
}
