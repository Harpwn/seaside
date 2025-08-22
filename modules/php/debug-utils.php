<?php
declare(strict_types=1);

trait DebugUtilsTrait
{
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

    function debug_playToEndGame() {
    }

    public function debug_goToState(int $state = 3) {
        $this->gamestate->jumpToState($state);
    }
}