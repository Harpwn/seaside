<?php

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

    function getTokenData($tokenId) {
        return TOKENS[$tokenId] ?? null;
    }
}
