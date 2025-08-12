<?php

trait NotificationsTrait
{
    function nfTokenPlayed (int $player_id, Token $token) {
        $this->notify->all("tokenPlayed", clienttranslate('${player_name} plays ${token_side}'), [
            "player_id" => $player_id,
            "token_side" => $token->getSide(),
            "token_id" => $token->id,
        ]);
    }

    function nfTokenToSea (Token $token) {
        $this->notify->all("tokenToSea", clienttranslate('${token_side} played into the sea'), [
            "token_side" => $token->getSide(),
            "token_id" => $token->id,
        ]);
    }

    function nfTokenToPlayerArea(int $player_id, Token $token, int $pile_id) {
        $this->notify->all("tokenToPlayerArea", clienttranslate('${token_side} played into ${player_name}\'s shore'), [
            "token_side" => $token->getSide(),
            "token_id" => $token->id,
            "player_id" => $player_id,
            "pile_id" => $pile_id
        ]);
    }

    function nfTokensToPlayerArea(int $player_id, array $tokens, int $pile_id) {
        $ids = array_keys(array_filter(array_column($tokens, "call", "id")));
        $this->notify->all("tokenToPlayerArea", clienttranslate('${token_side}\'s played into ${player_name}\'s shore'), [
            "token_side" => $tokens[0]->getSide(),
            "token_ids" => $ids,
            "player_id" => $player_id,
            "pile_id" => $pile_id
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