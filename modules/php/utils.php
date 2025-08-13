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
    function getAllTokensOfTypeForLocation(string $location, string $type, int $location_args = NULL): array
    {
        $tokens = $this->tokens->getCardsInLocation($location, $location_args);
        $items = array_filter($tokens, function ($token) use ($type) {
            $flipped = $this->dbGetTokenFlipped($token);
            $tokenTyped = new Token($token);
            return $tokenTyped->getActiveType($flipped) === $type;
        });
        return array_map(function ($item) {
            return new Token($item);
        }, $items);
    }
}
