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
            "token" => $token,
            "test" => "test value",
        ];
    }

    public function argStealCrab(): array
    {

        return [
            "playersWithCrabsIds" => []
        ];
    }

    public function argFlipBeach(): array
    {
        return [
            "flippableBeachIds" => []
        ];
    }

    public function argSelectIsopods(): array
    {
        return [
            "selectableIsopodIds" => []
        ];
    }
}
