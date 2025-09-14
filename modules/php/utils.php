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

    function updatePlayerScore(int $playerId): void
    {
        $totalPlayerTokens = count($this->tokens->getCardsInLocation((string)$playerId));
        $this->dbSetNewScore($playerId, $totalPlayerTokens);
    }

    function isSoloGame(): bool
    {
        return count($this->getPlayersIds()) == 1;
    }

    function getSoloGameResultText(): string
    {
        $playerId = $this->getPlayersIds()[0];
        $totalPlayerTokens = count($this->tokens->getCardsInLocation((string)$playerId));
        if ($totalPlayerTokens <= 19) {
            return clienttranslate('"The wind, rain, and cold have cut your walk short."');
        } else if ($totalPlayerTokens <= 29) {
            return clienttranslate('"It was a grey day, but the salt air was invigorating."');
        } else if ($totalPlayerTokens <= 39) {
            return clienttranslate('"The wind was blowing hard, and the sea was imposing. A bit scary but also a bit exciting!"');
        } else if ($totalPlayerTokens <= 49) {
            return clienttranslate('"A very satisfying outing! Your mind is filled with wonderful memories."');
        } else if ($totalPlayerTokens <= 59) {
            return clienttranslate('"The sun was shining, the waves were magnificent, and nature showed itself in all its splendor."');
        } else {
            return clienttranslate('"You have discovered a completely unmatched and unique beach! This was a once-in-a-lifetime experience."');
        }
    }

    function getSandpiperConfirmationWarnings()
    {
        return [
            'EMPTY_SEA' => clienttranslate("There are no Isopods in the sea and you have an existing pile bigger than one, playing this will cause it to be discarded."),
            'SMALLER_PILE' => clienttranslate("!NEW_PILE_SIZE tokens is less than your current largest pile (!MAX_PILE_SIZE), so this pile will be discarded."),
            'LARGER_PILE' => clienttranslate("!NEW_PILE_SIZE tokens is your largest pile, all smaller piles will be discarded losing you !OTHER_PILE_TOKEN_COUNTS tokens."),
        ];
    }
}