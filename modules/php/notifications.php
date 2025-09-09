<?php
declare(strict_types=1);

trait NotificationsTrait
{
    function nfTokenPlayed (int $playerId, Token $token) {
        $this->debugLog([$playerId, $token], 'nfTokenPlayed');
        $this->notify->all("tokenPlayed", clienttranslate('${playerName} plays ${tokenSide}'), [
            "playerId" => $playerId,
            "tokenSide" => $token->activeType,
            "token" => $token,
        ]);
    }

    function nfTokenToSea (Token $token, int $tokenLocationArgs) {
        $this->debugLog([$token, $tokenLocationArgs], 'nfTokenToSea');
        $this->notify->all("tokenToSea", clienttranslate('${tokenSide} played into the sea'), [
            "tokenSide" => $token->activeType,
            "token" => $token,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenToPlayerArea(int $playerId, Token $token, int $tokenLocationArgs = 0) {
        $this->debugLog([$playerId, $token, $tokenLocationArgs], 'nfTokenToPlayerArea');
        $this->notify->all("tokenToPlayerArea", clienttranslate('${tokenSide} played into ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "token" => $token,
            "playerId" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenMovesWithinPlayerArea(int $playerId, Token $token, int $fromLocationArgs, int $toLocationArgs) {
        $this->debugLog([$playerId, $token, $fromLocationArgs, $toLocationArgs], 'nfTokenMovesWithinPlayerArea');
        $this->notify->all("tokenMovesWithinPlayerArea", clienttranslate('${tokenSide} moves within ${playerName}\'s shore'), [
            "tokenSide" => $token->activeType,
            "token" => $token,
            "playerId" => $playerId,
            "fromLocationArgs" => $fromLocationArgs,
            "toLocationArgs" => $toLocationArgs
        ]);
    }

    function nfCrabStolen(int $playerId, int $thiefId, Token $token) {
        $this->debugLog([$playerId, $thiefId, $token], 'nfCrabStolen');
        $this->notify->all("crabStolen", clienttranslate('One of ${playerName}\'s CRAB tokens is stolen'), [
            "playerId" => $playerId,
            "token" => $token,
            "thiefId" => $thiefId
        ]);
    }

    function nfRockGetsCrabs(int $playerId, array $crabs) {
        $this->debugLog([$playerId, $crabs], 'nfRockGetsCrabs');
        $this->notify->all("rockGetsCrabs", clienttranslate('${playerName}\'s ROCK pair attracts ${tokenCount} CRAB tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($crabs),
            "tokens" => $crabs,
        ]);
    }

    function nfBeachGetsShells(int $playerId, array $seaShells) {
        $this->debugLog([$playerId, $seaShells], 'nfBeachGetsShells');
        $this->notify->all("beachGetsShells", clienttranslate('${playerName}\'s Beaches find ${tokenCount} buried SHELL tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($seaShells),
            "tokens" => $seaShells,
        ]);
    }

    function nfcreateSandpiperPile(int $playerId, array $tokens) {
        $this->debugLog([$playerId, $tokens], 'nfcreateSandpiperPile');
        $this->notify->all("createSandpiperPile", clienttranslate('${playerName}\'s SANDPIPER grabs a pile of ${tokenCount} tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($tokens),
            "tokens" => $tokens,
        ]);
    }

    function nfSandpiperIsopodsLost(int $playerId, array $pileTokens) {
        $this->debugLog([$playerId, $pileTokens], 'nfSandpiperIsopodsLost');
        $this->notify->all("sandpiperIsopodsLost", clienttranslate('${playerName} loses SANDPIPER pile of ${tokenCount} tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($pileTokens),
            "tokens" => $pileTokens,
        ]);
    }

    function nfBeachFlip(int $playerId, Token $beach) {
        $this->debugLog([$playerId, $beach], 'nfBeachFlip');
        $this->notify->all("beachFlip", clienttranslate('${playerName}\'s WAVE washes away a BEACH to reveal a ${otherSideType} token'), [
            "playerId" => $playerId,
            "token" => $beach,
            "otherSideType" => $beach->inactiveType
        ]);
    }

    function nfEndGameWaveBonus(int $playerId, array $seaTokens) 
    {
        $this->debugLog([$playerId, $seaTokens], 'nfEndGameWaveBonus');
        $this->notify->all("endGameWaveBonus", clienttranslate('${playerName} has the most waves, so they get the ${tokenCount} leftover sea tokens'), [
            "playerId" => $playerId,
            "tokenCount" => count($seaTokens),
            "tokens" => $seaTokens,
        ]);
    }

    function nfEndGameWaveBonusTie(array $playerIdsAndTokens) 
    {
        $this->debugLog($playerIdsAndTokens, 'nfEndGameWaveBonusTie');
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
        $this->debugLog($playerId, 'nfPlayAgain');
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