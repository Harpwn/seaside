<?php
declare(strict_types=1);

trait DebugUtilsTrait
{
    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }

    function debug_playToEndGame() {
    }

    public function debug_goToState(int $state = 3) {
        $this->gamestate->jumpToState($state);
    }
}