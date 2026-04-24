<?php

declare(strict_types=1);

namespace Bga\Games\Seaside;

require_once __DIR__ . "/constants.inc.php";
require_once __DIR__ . "/objects/token.php";

class Game extends \Bga\GameFramework\Table
{
    private \Bga\GameFramework\Components\Deck $tokens;

    public function __construct()
    {
        parent::__construct();
        require 'material.inc.php';
        $this->initGameStateLabels([]);
        $this->addPlayerNameDecorator();

        $this->tokens = $this->bga->deckFactory->createDeck("card");
    }

    protected function setupNewGame($players, $options = [])
    {
        $gameinfos = $this->getGameinfos();
        $defaultColors = $gameinfos['player_colors'];
        $this->createPlayers($players, $defaultColors);
        $this->reattributeColorsBasedOnPreferences($players, $defaultColors);
        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();
        $this->setupTokens();

        $this->initStat('player', STAT_NO_CRAB, 0);
        $this->initStat('player', STAT_NO_ROCK, 0);
        $this->initStat('player', STAT_NO_WAVE, 0);
        $this->initStat('player', STAT_NO_BEACH, 0);
        $this->initStat('player', STAT_NO_SHELL, 0);
        $this->initStat('player', STAT_NO_ISOPOD, 0);
        $this->initStat('player', STAT_NO_SANDPIPER, 0);
        $this->initStat('player', STAT_NO_SEATOKENS, 0);

        return \Bga\Games\Seaside\States\DrawToken::class;
    }

    protected function getAllDatas(): array
    {
        $result = [];

        // WARNING: We must only return information visible by the current player.
        $currentPlayerId = (int) $this->getCurrentPlayerId();

        // Get information about players.
        // NOTE: you can retrieve some extra field you added for "player" table in `dbmodel.sql` if you need it.
        $result["players"] = $this->getCollectionFromDb(
            "SELECT `player_id` `id`, `player_score` `score` FROM `player`"
        );

        foreach ($result['players'] as $playerId => &$player) {
            $player['tokens'] = $this->getAllTokensForLocation((string)$playerId);
        }

        $result['bagToken'] = $this->getTokenInPlay();
        $result['seaTokens'] = $this->getAllTokensForLocation(SEA_LOCATION);
        $result['deckRemainingCount'] = $this->tokens->countCardsInLocation(BAG_LOCATION);
        $result['gameProgression'] = $this->getGameProgression();

        if ($this->isSoloGame() && $this->gamestate->getCurrentMainState()['name'] == 'gameEnd') {
            $result['soloResultText'] = $this->getSoloGameResultText();
        }

        $result['sandPiperWarnings'] = $this->SANDPIPER_WARNINGS;
        $result['waveWarning'] = $this->WAVE_WARNING;
        $result['tokenDescriptions'] = $this->TOKEN_DESCRIPTIONS;

        return $result;
    }

    function setupTokens()
    {
        $TokenDeck = DECK;
        //$TokenDeck = TEST_DECK_ROCKS;
        //$TokenDeck = TEST_DECK_PIPERS;
        //$TokenDeck = TEST_DECK_BEACHES;
        //$TokenDeck = TEST_DECK_WAVES;
        //$TokenDeck = TEST_DECK_END_GAME_BONUS;

        $deck = array();
        foreach ($TokenDeck as $token) {
            $typeVal = "{$token[1]}/{$token[2]}";
            $deck[] = array('type' => $typeVal, 'type_arg' => 1, 'nbr' => 1);
        }
        $this->tokens->createCards($deck);
        // test player area limits
        //foreach ($this->getPlayersIds() as $playerId) {
        //    $this->tokens->createCards($deck, (string)$playerId);
        //}
        $this->tokens->shuffle(BAG_LOCATION);

        if ($this->isFullBagGame()) {
            return;
        }

        // get number of players
        $numPlayers = count($this->getPlayersIds());
        switch ($numPlayers) {
            case 2:
                // Remove 30-40 tokens
                $this->removeNoTokens(bga_rand(30, 40));
                break;
            case 3:
                // Remove 15-20 tokens
                $this->removeNoTokens(bga_rand(15, 20));
                break;
            case 1:
            case 4:
            case 5:
                //All Tokens Used
                break;
            default:
                throw new \feException("Invalid number of players: {$numPlayers}");
        }
    }


    function drawRandomToken(): Token
    {
        $topToken = $this->tokens->getCardOnTop(BAG_LOCATION);
        $this->tokens->moveCard($topToken['id'], DRAWN_LOCATION);
        return new Token($topToken, false);
    }

    function getTokenInPlay(): Token | null
    {
        $topToken = $this->tokens->getCardOnTop(DRAWN_LOCATION);
        if ($topToken != null) {
            return new Token($topToken, false);
        }
        return null;
    }

    function removeNoTokens(int $n): void
    {
        for ($i = 0; $i < $n; $i++) {
            $token = $this->drawRandomToken();
            $this->tokens->moveCard($token->id, EXCLUDED_LOCATION);
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

    function updatePlayerScores(): void
    {
        foreach ($this->getPlayersIds() as $playerId) {
            $totalPlayerTokens = count($this->tokens->getCardsInLocation((string)$playerId));
            $this->dbSetNewScore($playerId, $totalPlayerTokens);
        }
    }

    function isSoloGame(): bool
    {
        return count($this->getPlayersIds()) == 1;
    }

    function getSoloGameResultText(): string
    {
        $playerId = $this->getPlayersIds()[0];
        $totalPlayerTokens = count($this->tokens->getCardsInLocation((string)$playerId));
        foreach ($this->SOLO_RESULT_TEXTS as $threshold => $text) {
            if ($totalPlayerTokens <= $threshold) {
                return $text;
            }
        }
    }

    function isFullBagGame(): bool
    {
        return (int)$this->tableOptions->get(100) > 0;
    }

    function nfTokenToSea(Token $token, int $tokenLocationArgs)
    {
        //$this->debugLog([$token, $tokenLocationArgs], 'nfTokenToSea');
        $this->notify->all("tokenToSea", clienttranslate('🔵 ${tokenSideEmoji} ${tokenSide} played into the sea'), [
            'i18n' => ['tokenSide'],
            "tokenSide" => $token->activeType,
            "tokenSideEmoji" => $this->getEmojiForType($token->activeType),
            "token" => $token,
            "tokenLocationArgs" => $tokenLocationArgs
        ]);
    }

    function nfSoloTokenLimitReached(string $tokenType)
    {
        $this->notify->all("soloTokenLimitReached", clienttranslate('🏁 You have reached 7 ${tokenType} tokens, the game ends immediately.'), [
            'i18n' => ['tokenType'],
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

    public function getDeckRemainingCount(): int
    {
        return (int)$this->tokens->countCardsInLocation(BAG_LOCATION);
    }

    public function getEmojiForType(string $type)
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

    public function getGameProgression()
    {
        // get tokens left in deck
        $excluded_tokens_count = $this->tokens->countCardsInLocation(EXCLUDED_LOCATION);
        $tokens_locations = $this->tokens->countCardsInLocations();
        $deck_tokens_count = $tokens_locations[BAG_LOCATION] ?? 0;
        $total_tokens_count = array_sum($tokens_locations) - $excluded_tokens_count;

        return ($total_tokens_count - $deck_tokens_count) / $total_tokens_count * 100;
    }


    public function zombieTurn(array $state, int $active_player): void
    {
        if ($state["type"] === "activeplayer") {
            $this->autoplay_state($state["name"], $active_player);
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state['name']}\".");
    }

    public function upgradeTableDb($from_version)
    {
    }

    private function autoplay_state(string $stateName, int $playerId = -1): void
    {
        if ($playerId === -1) {
            $playerId = (int)$this->getActivePlayerId();
        }
        $transition = match($stateName) {
            'playToken'     => (new \Bga\Games\Seaside\States\PlayToken($this))->zombie($playerId),
            'stealCrab'     => (new \Bga\Games\Seaside\States\StealCrab($this))->zombie($playerId),
            'flipBeach'     => (new \Bga\Games\Seaside\States\FlipBeach($this))->zombie($playerId),
            'selectIsopods' => (new \Bga\Games\Seaside\States\SelectIsopods($this))->zombie($playerId),
            'playAgain'     => (new \Bga\Games\Seaside\States\PlayAgain($this))->zombie($playerId),
            default         => throw new \feException("Zombie mode not supported at state: \"{$stateName}\"."),
        };
        // Zombie methods now return class names — resolve to state ID and jump
        if (class_exists($transition)) {
            $this->gamestate->jumpToState((new $transition($this))->id);
        } else {
            $this->gamestate->nextState($transition);
        }
    }

    private function createPlayers($players, $defaultColors)
    {
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
        foreach ($players as $playerId => $player) {
            $color = array_shift($defaultColors);
            $values[] = "('" . $playerId . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "')";
        }
        $sql .= implode(',', $values);
        $this->DbQuery($sql);
    }

    private function dbGetTokenFlipped($tokenId): bool
    {
        //get flipped col from cards table by id 
        return $this->getUniqueValueFromDB("SELECT `flipped` FROM `card` WHERE `card_id` = $tokenId") == 1;
    }

    private function dbFlipToken(Token $token)
    {
        //Get opposite side value
        $tinyIntFlipped = $token->flipped ? 0 : 1;
        $tokenId = $token->id;
        //Set in DB
        $this->DbQuery("UPDATE `card` SET `flipped` = $tinyIntFlipped WHERE `card_id` = $tokenId");
    }

    private function dbSetNewScore(int $playerId, int $newScore)
    {
        $this->bga->playerScore->set($playerId, $newScore);
    }

    function sendTokenToSea(Token $token)
    {
        $this->tokens->moveCard($token->id, SEA_LOCATION, 0);
        $this->nfTokenToSea($token, 0);
    }

    function sendTokenToPlayerArea(Token $token, int $playerId, int $tokenLocationArgs = 0)
    {
        $this->tokens->moveCard($token->id, (string)$playerId, $tokenLocationArgs);
    }

    function sendTokenToPlayArea(Token $token)
    {
        $this->tokens->moveCard($token->id, PLAY_LOCATION, 0);
    }

    function sendTokensToPlayerArea(array $tokens, int $playerId, int $tokenLocationArgs = 0)
    {
        if (count($tokens) == 0) {
            return;
        }
        $tokenIds = array_map(function ($token) {
            return $token->id;
        }, $tokens);
        $this->tokens->moveCards($tokenIds, (string)$playerId, $tokenLocationArgs);
    }

    function moveTokenWithinPlayerArea(int $playerId, Token $token, int $toLocationArgs)
    {
        $this->tokens->moveCard($token->id, (string)$playerId, $toLocationArgs);
    }

    function sendTokensToDiscard(array $tokens)
    {
        if (count($tokens) == 0) {
            return;
        }
        $this->tokens->moveCards(array_column($tokens, 'id'), DISCARD_LOCATION);
    }

    function flipToken(Token $token)
    {
        $this->dbFlipToken($token);
    }

    function soloGameEndConditionMet(): bool
    {
        $seaTokens = $this->getAllTokensForLocation(SEA_LOCATION);
        if (count($seaTokens) >= 7) {
            $this->nfSoloTokenLimitReached('Sea');
            return true;
        }

        $playerId = (int)$this->getActivePlayerId();
        $playerTokens = $this->getAllTokensForLocation((string)$playerId);
        $filteredTokens = array_filter($playerTokens, function ($token) {
            return $token->activeType !== SHELL && $token->activeType !== ISOPOD && $token->activeType !== CRAB;
        });
        $typeCounts = [];
        foreach ($filteredTokens as $token) {
            if (!array_key_exists($token->activeType, $typeCounts)) {
                $typeCounts[$token->activeType] = 0;
            }
            $typeCounts[$token->activeType]++;
            if ($typeCounts[$token->activeType] >= 7) {
                $this->nfSoloTokenLimitReached($token->activeType);
                return true;
            }
        }

        return false;
    }

    function gameEndOrNextState(callable $toNextState): string
    {
        $remainingTokens = $this->tokens->countCardsInLocation(BAG_LOCATION);
        if ($this->isSoloGame()) {
            $gameEnds = $this->soloGameEndConditionMet();
            if ($gameEnds || $remainingTokens == 0) {
                return \Bga\Games\Seaside\States\PreEndGame::class;
            } else {
                return $toNextState();
            }
        } else if ($remainingTokens == 0) {
            return \Bga\Games\Seaside\States\PreEndGame::class;
        } else {
            return $toNextState();
        }
    }

    // ---- Debug functions (Studio only) ----

    function debug_dumpGameState(): void
    {
        $this->dump('bagCount', $this->tokens->countCardsInLocation(BAG_LOCATION));
        $this->dump('drawnToken', $this->getTokenInPlay());
        $this->dump('seaTokens', $this->getAllTokensForLocation(SEA_LOCATION));
        foreach ($this->getPlayersIds() as $playerId) {
            $this->dump("player_{$playerId}_tokens", $this->getAllTokensForLocation((string)$playerId));
        }
    }

    function debug_drawTokenOfType(string $type): void
    {
        $allInBag = $this->tokens->getCardsInLocation(BAG_LOCATION);
        foreach ($allInBag as $card) {
            $parts = explode('/', $card['type']);
            if (in_array(strtoupper($type), array_map('strtoupper', $parts))) {
                $this->tokens->moveCard($card['id'], DRAWN_LOCATION);
                $token = new Token($card, false);
                $this->notify->all("tokenDrawn", "DEBUG: Drew {$token->side1}/{$token->side2} token", [
                    "token" => $token,
                    "tokenSide1Type" => $token->side1,
                    "tokenSide1Emoji" => $this->getEmojiForType($token->side1),
                    "tokenSide2Type" => $token->side2,
                    "tokenSide2Emoji" => $this->getEmojiForType($token->side2),
                ]);
                return;
            }
        }
        $this->dump('debug_drawTokenOfType', "No token of type '$type' found in bag");
    }

    function debug_skipToEndGame(): void
    {
        $this->tokens->moveAllCardsInLocation(BAG_LOCATION, EXCLUDED_LOCATION);
        $this->gamestate->jumpToState(GAME_STATE_PRE_END_GAME);
    }

    function debug_playNMoves(int $n = 5): void
    {
        for ($i = 0; $i < $n; $i++) {
            $state = $this->gamestate->getCurrentMainState();
            if ($state['type'] !== 'activeplayer') {
                break;
            }
            $this->zombieTurn($state, (int)$this->getActivePlayerId());
        }
        $this->notify->all("message", "DEBUG: Played {$n} moves", []);
    }
}
