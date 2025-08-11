<?php

trait NotificationsTrait
{
    function nfTokenSidePlayed ($player_id, $token) {
        $this->notify->all("tokenSidePlayed", clienttranslate('${player_name} plays ${token_side_name}'), [
            "player_id" => $player_id,
            "token_side_name" => $token.name,
            "token_id" => $token.id,
        ]);
    }

    function addPlayerNameDecorator() 
    {
        $this->notify->addDecorator(function (string $message, array $args) {
            if (isset($args['player_id']) && !isset($args['player_name']) && str_contains($message, '${player_name}')) {
                $args['player_name'] = $this->getPlayerNameById($args['player_id']);
            }
            return $args;
        });
    }
}