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
            "token" => $this->drawRandomToken()
        ];
    }

    public function argStealCrab(): array
    {
        $playersWithCrabIds = [];
        foreach ($this->getPlayersIds() as $playerId) {
            if ($this->getActivePlayerId() != $playerId) {
                $crabs = $this->getAllTokensOfTypeForLocation((string)$playerId, CRAB);
                if (count($crabs) > 0) {
                    $playersWithCrabIds[] = (int)$playerId;
                }
            }
        }
        return [
            "playersWithCrabsIds" => $playersWithCrabIds
        ];
    }

    public function argFlipBeach(): array
    {
        return [
            "flippableBeachIds" => array_column($this->getAllTokensOfTypeForLocation((string)$this->getActivePlayerId(), BEACH), 'id')
        ];
    }

    public function argSelectIsopods(): array
    {
        $tokens = $this->getAllTokensOfTypeForLocation((string)$this->getActivePlayerId(), ISOPOD);
        //group by locationAArgs
        $currentPileSizes = [];
        foreach ($tokens as $token) {
            $locationArg = $token->locationArg;
            if (!isset($currentPileSizes[$locationArg])) {
                $currentPileSizes[$locationArg] = 1;
            }
            $currentPileSizes[$locationArg]++;
        }

        return [
            "sandpiperId" => $this->getAllTokensOfTypeForLocation((string)$this->getActivePlayerId(), SANDPIPER, 0)[0]->id,
            "selectableIsopodIds" => array_column($this->getAllTokensOfTypeForLocation(SEA_LOCATION, ISOPOD), 'id'),
            "currentPileSizes" => array_values($currentPileSizes)
        ];
    }
}
