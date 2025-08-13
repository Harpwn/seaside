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
        // Get some values from the current game situation from the database.
        $token = $this->drawRandomToken();

        return [
            "Token" => $token
        ];
    }

    public function argStealCrab(): array
    {

        return [
            "PlayersWithCrabsIds" => []
        ];
    }

    public function argFlipBeach(): array
    {
        return [
            "FlippableBeachIds" => []
        ];
    }

    public function argSelectIsopods(): array
    {
        return [
            "SelectableIsopodIds" => []
        ];
    }
}
