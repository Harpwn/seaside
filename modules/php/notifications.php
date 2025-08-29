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

    function nfTokenToPlayerArea(int $playerId, Token $token, int $tokenLocationArgs = 0) {
        $this->notify->all("tokenToPlayerArea", clienttranslate('${tokenSide} played into ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "tokenId" => $token->id,
            "playerId" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenMovesWithinPlayerArea(int $playerId, Token $token, int $fromLocationArgs, int $toLocationArgs) {
        $this->notify->all("tokenMovesWithinPlayerArea", clienttranslate('${tokenSide} moves within ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "tokenId" => $token->id,
            "playerId" => $playerId,
            "fromLocationArgs" => $fromLocationArgs,
            "toLocationArgs" => $toLocationArgs
        ]);
    }

    function nfCrabStolen(int $playerId, int $thiefId, Token $token) {
        $this->notify->all("crabStolen", clienttranslate('One of ${playerName}\'s CRAB tokens is stolen'), [
            "playerId" => $playerId,
            "tokenId" => $token->id,
            "thiefId" => $thiefId
        ]);
    }

    function nfRockGetsCrabs(int $playerId, array $crabs) {
        $this->notify->all("rockGetsCrabs", clienttranslate('${playerName}\'s ROCK pair attracts ${crabCount} CRAB tokens'), [
            "playerId" => $playerId,
            "crabCount" => count($crabs),
            "tokenIds" => array_column($crabs, 'id'),
        ]);
    }

    function nfBeachGetsShells(int $playerId, array $seaShells) {
        $this->notify->all("beachGetsShells", clienttranslate('${playerName}\'s Beaches find ${shellCount} buried SHELL tokens'), [
            "playerId" => $playerId,
            "shellCount" => count($seaShells),
            "tokenIds" => array_column($seaShells, 'id'),
        ]);
    }

    function nfSandpiperGetsIsopods(int $playerId, array $isopods, int $newSandpiperPileId) {
        $this->notify->all("sandpiperGetsIsopods", clienttranslate('${playerName}\'s SANDPIPER grabs a pile of ${isopodCount} ISOPOD tokens'), [
            "playerId" => $playerId,
            "isopodCount" => count($isopods),
            "tokenIds" => array_column($isopods, 'id'),
            "newSandpiperPileId" => $newSandpiperPileId
        ]);
    }

    function nfSandpiperIsopodsLost(int $playerId, int $sandpiperId, array $isopodIds) {
        $this->notify->all("sandpiperIsopodsLost", clienttranslate('${playerName} loses SANDPIPER with a pile of ${isopodCount} ISOPOD tokens'), [
            "playerId" => $playerId,
            "isopodCount" => count($isopodIds),
            "tokenIds" => $isopodIds,
            "sandpiperId" => $sandpiperId
        ]);
    }

    function nfBeachFlip(int $playerId, Token $beach) {
        $this->notify->all("beachFlip", clienttranslate('${playerName}\'s WAVE washes away a BEACH to reveal a ${otherSideType} token'), [
            "playerId" => $playerId,
            "tokenId" => $beach->id,
            "otherSideType" => $beach->inactiveType
        ]);
    }

    function nfEndGameWaveBonus(int $playerId, array $seaTokens) {
        $this->notify->all("endGameWaveBonus", clienttranslate('${playerName} has the most waves, so they get the ${tokenCount} leftover sea tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($seaTokens),
            "tokenIds" => array_column($seaTokens, 'id'),
        ]);
    }

    function nfEndGameWaveBonusTie(array $playerIdsAndTokenIds) 
    {
        $playerIds = array_keys($playerIdsAndTokenIds);
        $allPlayerNames = $this->dbGetPlayerNames();
        $playerNames = array_map(fn($id) => $allPlayerNames[$id] ?? '', $playerIds);
        $this->notify->all("endGameWaveBonusTie", clienttranslate('${playerNames} have tied for the most waves, so they each get ${tokenCount} leftover sea tokens'), [
            "playerIdsAndTokenIds" => $playerIdsAndTokenIds,
            "playerNames" => implode(',', array_keys($playerNames)),
            "tokenCount" => count($playerIdsAndTokenIds[array_key_first($playerIdsAndTokenIds)]),
        ]);
    }

    function nfPlayAgain(int $playerId) {
        $this->notify->all("playAgain", clienttranslate('${playerName} must play again'), [
            "playerId" => $playerId
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