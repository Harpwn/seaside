<?php
declare(strict_types=1);

trait NotificationsTrait
{
    function nfTokenPlayed (int $playerId, Token $token) {
        $this->notify->all("tokenPlayed", clienttranslate('${playerName} plays ${tokenSide}'), [
            "playerId" => $playerId,
            "tokenSide" => $token->activeType,
            "token" => $token,
        ]);
    }

    function nfTokenToSea (Token $token, int $tokenLocationArgs) {
        $this->notify->all("tokenToSea", clienttranslate('${tokenSide} played into the sea'), [
            "tokenSide" => $token->activeType,
            "token" => $token,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenToPlayerArea(int $playerId, Token $token, int $tokenLocationArgs = 0) {
        $this->notify->all("tokenToPlayerArea", clienttranslate('${tokenSide} played into ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "token" => $token,
            "playerId" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenMovesWithinPlayerArea(int $playerId, Token $token, int $fromLocationArgs, int $toLocationArgs) {
        $this->notify->all("tokenMovesWithinPlayerArea", clienttranslate('${tokenSide} moves within ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "token" => $token,
            "playerId" => $playerId,
            "fromLocationArgs" => $fromLocationArgs,
            "toLocationArgs" => $toLocationArgs
        ]);
    }

    function nfCrabStolen(int $playerId, int $thiefId, Token $token) {
        $this->notify->all("crabStolen", clienttranslate('One of ${playerName}\'s CRAB tokens is stolen'), [
            "playerId" => $playerId,
            "token" => $token,
            "thiefId" => $thiefId
        ]);
    }

    function nfRockGetsCrabs(int $playerId, array $crabs) {
        $this->notify->all("rockGetsCrabs", clienttranslate('${playerName}\'s ROCK pair attracts ${tokenCount} CRAB tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($crabs),
            "tokens" => $crabs,
        ]);
    }

    function nfBeachGetsShells(int $playerId, array $seaShells) {
        $this->notify->all("beachGetsShells", clienttranslate('${playerName}\'s Beaches find ${tokenCount} buried SHELL tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($seaShells),
            "tokens" => $seaShells,
        ]);
    }

    function nfSandpiperGetsIsopods(int $playerId, array $isopods, int $newSandpiperPileId) {
        $this->notify->all("sandpiperGetsIsopods", clienttranslate('${playerName}\'s SANDPIPER grabs a pile of ${tokenCount} ISOPOD tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($isopods),
            "tokens" => $isopods,
            "newSandpiperPileId" => $newSandpiperPileId
        ]);
    }

    function nfSandpiperIsopodsLost(int $playerId, array $pileTokens) {
        $this->notify->all("sandpiperIsopodsLost", clienttranslate('${playerName} loses SANDPIPER pile of ${tokenCount} tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($pileTokens),
            "tokens" => $pileTokens,
        ]);
    }

    function nfBeachFlip(int $playerId, Token $beach) {
        $this->notify->all("beachFlip", clienttranslate('${playerName}\'s WAVE washes away a BEACH to reveal a ${otherSideType} token'), [
            "playerId" => $playerId,
            "token" => $beach,
            "otherSideType" => $beach->inactiveType
        ]);
    }

    function nfEndGameWaveBonus(int $playerId, array $seaTokens) {
        $this->notify->all("endGameWaveBonus", clienttranslate('${playerName} has the most waves, so they get the ${tokenCount} leftover sea tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($seaTokens),
            "tokens" => $seaTokens,
        ]);
    }

    function nfEndGameWaveBonusTie(array $playerIdsAndTokens) 
    {
        $playerIds = array_keys($playerIdsAndTokens);
        $allPlayerNames = $this->dbGetPlayerNames();
        $playerNames = array_map(fn($id) => $allPlayerNames[$id]['player_name'] ?? '', $playerIds);
        $this->notify->all("endGameWaveBonusTie", clienttranslate('${playerNames} have tied for the most waves, so they each get ${tokenCount} leftover sea tokens'), [
            "playerIdsAndTokens" => $playerIdsAndTokens,
            "playerNames" => implode(',', array_values($playerNames)),
            "tokenCount" => count($playerIdsAndTokens[array_key_first($playerIdsAndTokens)]),
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