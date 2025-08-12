<?php

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait UtilsTrait
{
    function drawRandomToken($deck)
    {
        sort($deck);
        $idx = bga_rand(0, count($deck) - 1); // find a random card
        $drawn = $deck[$idx];
        array_splice($deck, $idx, 1);
        return $drawn;
    }

    function getPlayersIds()
    {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getAllTokensOfTypeForLocation(int $location, string $type, int $location_args = NULL) 
    {
        $tokens = $this->tokens->getCardsInLocation($location, $location_args);
        return array_filter($tokens, function ($token) use ($type) {
            return (new Token($token))->getSide() === $type;
        });
    }
}
