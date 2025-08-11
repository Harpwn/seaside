<?php

trait ArgsTrait {

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    public function argPlayerTurn(): array
    {
        // Get some values from the current game situation from the database.
        $token = $this->drawRandomToken();

        return [
            "Token" => $token
        ];
    }
    
}
