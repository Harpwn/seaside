<?php
declare(strict_types=1);

trait NotificationsTrait
{
    function nfTokenPlayed (int $playerId, Token $token) {
        $this->notify->all("tokenPlayed", clienttranslate('${playerName} plays ${tokenSide}'), [
            "playerId" => $playerId,
            "tokenSide" => $token->activeType,
            "tokenId" => $token->id,
        ]);
    }

    function nfTokenToSea (Token $token, int $tokenLocationArgs) {
        $this->notify->all("tokenToSea", clienttranslate('${tokenSide} played into the sea'), [
            "tokenSide" => $token->activeType,
            "tokenId" => $token->id,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenToPlayerArea(int $playerId, Token $token, int $tokenLocationArgs) {
        $this->notify->all("tokenToPlayerArea", clienttranslate('${tokenSide} played into ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "tokenId" => $token->id,
            "playerId" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokensToPlayerArea(int $playerId, array $tokens, int $tokenLocationArgs) {

        $ids = array_column($tokens, 'id');
        $this->notify->all("tokensToPlayerArea", clienttranslate('${tokenSide}\'s played into ${playerName}\'s shore'), [
            "tokenSide" => $tokens[0]->activeType,
            "tokenIds" => $ids,
            "playerId" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokensToDiscard(int $playerId, array $tokenIds) {
        $this->notify->all("tokensToDiscard", clienttranslate('${playerName} discards ${tokenCount} tokens'), [
            "tokenIds" => $tokenIds,
            "playerId" => $playerId,
            "tokenCount" => count($tokenIds)
        ]);
    }

    function addPlayerNameDecorator() 
    {
        $this->notify->addDecorator(function (string $message, array $args) {
            if (isset($args['playerId']) && !isset($args['playerName']) && str_contains($message, '${playerName}')) {
                $args['playerName'] = $this->getPlayerNameById($args['playerId']);
            }
            return $args;
        });
    }
}