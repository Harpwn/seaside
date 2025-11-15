<?php

declare(strict_types=1);

trait NotificationsTrait
{
    function nfTokenDrawn(Token $token)
    {
        $this->notify->all("tokenDrawn", clienttranslate('🆕 A new ${tokenSide1Emoji}/${tokenSide2Emoji} ${tokenSide1Type}/${tokenSide2Type} token is drawn'), [
            "token" => $token,
            "tokenSide1Type" => $token->side1,
            "tokenSide1Emoji" => $this->getEmojiForType($token->side1),
            "tokenSide2Type" => $token->side2,
            "tokenSide2Emoji" => $this->getEmojiForType($token->side2)
        ]);
    }
    
    function nfTokenPlayed(int $playerId, Token $token)
    {
        //$this->debugLog([$playerId, $token], 'nfTokenPlayed');
        $this->notify->all("tokenPlayed", clienttranslate('▶️ ${player_name} plays ${tokenSideEmoji} ${tokenSide}'), [
            "player_id" => $playerId,
            "tokenSide" => $token->activeType,
            "tokenSideEmoji" => $this->getEmojiForType($token->activeType),
            "token" => $token,
        ]);
    }

    function nfTokenToSea(Token $token, int $tokenLocationArgs)
    {
        //$this->debugLog([$token, $tokenLocationArgs], 'nfTokenToSea');
        $this->notify->all("tokenToSea", clienttranslate('🔵 ${tokenSideEmoji} ${tokenSide} played into the sea'), [
            "tokenSide" => $token->activeType,
            "tokenSideEmoji" => $this->getEmojiForType($token->activeType),
            "token" => $token,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfTokenToPlayerArea(int $playerId, Token $token, int $tokenLocationArgs = 0)
    {
        $this->notify->all("tokenToPlayerArea", clienttranslate('${tokenSideEmoji} ${tokenSide} played into ${player_name}\'s shore'), [
            "tokenSide" => $token->activeType,
            "tokenSideEmoji" => $this->getEmojiForType($token->activeType),
            "token" => $token,
            "player_id" => $playerId,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfCrabStolen(int $playerId, int $thiefId, Token $token)
    {
        $this->notify->all("crabStolen", clienttranslate('🏴‍☠️ One of ${player_name}\'s ${crabEmoji} CRAB tokens is stolen'), [
            "player_id" => $playerId,
            "token" => $token,
            "thiefId" => $thiefId,
            "crabEmoji" => $this->getEmojiForType('CRAB')
        ]);
    }

    function nfRockGetsCrabs(int $playerId, array $crabs)
    {
        $this->notify->all("rockGetsCrabs", clienttranslate('⤴️ ${player_name}\'s ${rockEmoji} ROCK pair attracts ${tokenCount} ${crabEmoji} CRAB tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($crabs),
            "tokens" => $crabs,
            "rockEmoji" => $this->getEmojiForType('ROCK'),
            "crabEmoji" => $this->getEmojiForType('CRAB')
        ]);
    }

    function nfBeachGetsShells(int $playerId, array $seaShells)
    {
        $this->notify->all("beachGetsShells", clienttranslate('⤴️ ${player_name}\'s ${beachEmoji} Beaches find ${tokenCount} buried ${shellEmoji} SHELL tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($seaShells),
            "tokens" => $seaShells,
            "beachEmoji" => $this->getEmojiForType('BEACH'),
            "shellEmoji" => $this->getEmojiForType('SHELL')
        ]);
    }

    function nfcreateSandpiperPile(int $playerId, array $tokens)
    {
        $this->notify->all("createSandpiperPile", clienttranslate('⤴️ ${player_name}\'s ${sandpiperEmoji} SANDPIPER grabs a pile of ${tokenCount} tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($tokens),
            "tokens" => $tokens,
            "sandpiperEmoji" => $this->getEmojiForType('SANDPIPER')
        ]);
    }

    function nfSandpiperIsopodsLost(int $playerId, array $pileTokens)
    {
        $this->notify->all("sandpiperIsopodsLost", clienttranslate('🚮 ${player_name} loses ${sandpiperEmoji} SANDPIPER pile of ${tokenCount} tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($pileTokens),
            "tokens" => $pileTokens,
            "sandpiperEmoji" => $this->getEmojiForType('SANDPIPER')
        ]);
    }

    function nfBeachFlip(int $playerId, Token $beach)
    {
        $this->notify->all("beachFlip", clienttranslate('🔃 ${player_name}\'s ${waveEmoji} WAVE washes away a ${beachEmoji} BEACH to reveal a ${otherSideEmoji} ${otherSideType} token'), [
            "player_id" => $playerId,
            "token" => $beach,
            "otherSideType" => $beach->inactiveType,
            "otherSideEmoji" => $this->getEmojiForType($beach->inactiveType),
            "waveEmoji" => $this->getEmojiForType('WAVE'),
            "beachEmoji" => $this->getEmojiForType('BEACH')
        ]);
    }

    function nfEndGameWaveBonus(int $playerId, array $seaTokens)
    {
        $this->notify->all("endGameWaveBonus", clienttranslate('🏅 ${player_name} has the most ${waveEmoji} waves, so they get the ${tokenCount} leftover sea tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($seaTokens),
            "tokens" => $seaTokens,
            "waveEmoji" => $this->getEmojiForType('WAVE')
        ]);
    }

    function nfEndGameWaveBonusTie(array $playerIdsAndTokens)
    {
        $playerIds = array_keys($playerIdsAndTokens);
        $allPlayerNames = $this->dbGetPlayerNames();
        $playerNames = array_map(fn($id) => $allPlayerNames[$id]['player_name'] ?? '', $playerIds);
        $this->notify->all("endGameWaveBonusTie", clienttranslate('🏅 ${playerNames} have tied for the most ${waveEmoji} waves, so they each get ${tokenCount} leftover sea tokens'), [
            "playerIdsAndTokens" => $playerIdsAndTokens,
            "playerNames" => implode(',', array_values($playerNames)),
            "tokenCount" => count($playerIdsAndTokens[array_key_first($playerIdsAndTokens)]),
            "waveEmoji" => $this->getEmojiForType('WAVE')
        ]);
    }

    function nfPlayAgain(int $playerId)
    {
        $this->notify->all("playAgain", clienttranslate('🔄 ${player_name} must play again'), [
            "player_id" => $playerId
        ]);
    }

    function nfEndGameScoring(array $tokensByPlayer)
    {
        if ($this->isSoloGame()) {
            $this->notify->all("endGameScoringSolo", clienttranslate('🏆 End game scoring results (solo)'), [
                "tokensByPlayer" => $tokensByPlayer,
                "resultText" => $this->getSoloGameResultText()
            ]);
        } else {
            $this->notify->all("endGameScoring", clienttranslate('🏆 End game scoring results'), [
                "tokensByPlayer" => $tokensByPlayer
            ]);
        }
    }

    function nfSoloTokenLimitReached(string $tokenType) {
        $this->notify->all("soloTokenLimitReached", clienttranslate('🏁 You have reached 7 ${tokenType} tokens, the game ends immediately.'), [
            "tokenType" => $tokenType
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

    private function getEmojiForType(string $type) 
    {
        switch ($type) {
            case 'CRAB':
                return '🦀';
            case 'SHELL':
                return '🐚';
            case 'WAVE':
                return '🌊';
            case 'BEACH':
                return '🏖️';
            case 'ROCK':
                return '🪨';
            case 'SANDPIPER':
                return '🐦';
            case 'ISOPOD':
                return '🐛';
        }
    }
}
