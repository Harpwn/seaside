<?php
declare(strict_types=1);

require_once('utils.php');

trait ArgsTrait {
    use UtilsTrait;

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    public function argPlayToken(): array
    {
        return [
            "token" => $this->drawRandomToken(),
            "currentPileSizes" => $this->getCurrentPileSizes(),
            "selectableIsopods" => $this->getSelectableIsopods(),
            "gameProgression" => $this->getGameProgression()
        ];
    }

    public function argStealCrab(): array
    {
        $playersWithCrabs = [];
        foreach ($this->getPlayersIds() as $playerId) {
            if ($this->getActivePlayerId() != $playerId) {
                $crabs = $this->getAllTokensOfTypeForLocation((string)$playerId, CRAB);
                if (count($crabs) > 0) {
                    $playersWithCrabs[] = [ "id" => (int)$playerId, "name" => $this->getPlayerNameById($playerId) ];
                }
            }
        }
        return [
            "playersWithCrabs" => $playersWithCrabs
        ];
    }

    public function argFlipBeach(): array
    {
        return [
            "flippableBeachs" => $this->getAllTokensOfTypeForLocation((string)$this->getActivePlayerId(), BEACH)
        ];
    }

    public function argSelectIsopods(): array
    {
        return [
            "sandpiper" => $this->getAllTokensOfTypeForLocation(PLAY_LOCATION, SANDPIPER)[0],
            "selectableIsopods" => $this->getSelectableIsopods(),
            "currentPileSizes" => $this->getCurrentPileSizes()
        ];
    }

    private function getCurrentPileSizes(): array 
    {
        $tokens = $this->getAllTokensOfTypeForLocation((string)$this->getActivePlayerId(), ISOPOD);
        $currentPileSizes = [];
        foreach ($tokens as $token) {
            $locationArg = $token->locationArg;
            if (!isset($currentPileSizes[$locationArg])) {
                $currentPileSizes[$locationArg] = 1;
            }
            $currentPileSizes[$locationArg]++;
        }
        return array_values($currentPileSizes);
    }

    private function getSelectableIsopods(): array
    {
        return $this->getAllTokensOfTypeForLocation(SEA_LOCATION, ISOPOD);
    }
}
