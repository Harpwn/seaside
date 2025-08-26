<?php

declare(strict_types=1);

require_once('db.php');

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait UtilsTrait
{
    use DbTrait;

    function drawRandomToken(): Token
    {
        $topToken = $this->tokens->getCardOnTop(BAG_LOCATION);
        return new Token($topToken, false);
    }

    function removeNoTokens(int $n): void
    {
        for ($i = 0; $i < $n; $i++) {
            $token = $this->drawRandomToken();
            $this->tokens->moveCard($token->id, DISCARD_LOCATION);
        }
    }

    /**
     * @return int[]
     */
    function getPlayersIds(): array
    {
        return array_keys($this->loadPlayersBasicInfos());
    }

    /**
     * @return Token[]
     */
    function getAllTokensOfTypeForLocation(string $location, string $type, int $locationArgs = NULL): array
    {
        $tokens = $this->tokens->getCardsInLocation($location, $locationArgs);
        $items = array_filter($tokens, function ($token) use ($type) {
            $tokenTyped = $this->getToken((int)$token['id']);
            return $tokenTyped->activeType === $type;
        });
        return array_values(array_map(function ($item) {
            return $this->getToken((int)$item['id']);
        }, $items));
    }

    function getAllTokensForLocation(string $location)
    {
        $tokens = $this->tokens->getCardsInLocation($location);
        return array_values(array_map(function ($item) {
            return $this->getToken((int)$item['id']);
        }, $tokens));
    }

    function getToken(int $tokenId): Token
    {
        $card = $this->tokens->getCard($tokenId);
        return new Token($card, $this->dbGetTokenFlipped($tokenId));
    }

    function getTokens(array $tokenIds): array
    {
        if (count($tokenIds) == 0) {
            return [];
        }
        $cards = $this->tokens->getCards($tokenIds);
        return array_values(array_map(function ($item) {
            return new Token($item, $this->dbGetTokenFlipped($item['id']));
        }, $cards));
    }

    function updatePlayerScore(int $playerId): void
    {
        $totalPlayerTokens = count($this->tokens->getCardsInLocation((string)$playerId));
        $this->dbSetNewScore($playerId, $totalPlayerTokens);
    }
}