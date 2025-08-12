<?php

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait UtilsTrait
{
    function drawRandomToken(): Token
    {
        return new Token($this->tokens->getCardOnTop(BAG_LOCATION));
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
    function getAllTokensOfTypeForLocation(int $location, string $type, int $location_args = NULL): array
    {
        $tokens = $this->tokens->getCardsInLocation($location, $location_args);
        $items = array_filter($tokens, function ($token) use ($type) {
            return (new Token($token))->getSide() === $type;
        });
        return array_map(function ($item) {
            return new Token($item);
        }, $items);
    }
}
