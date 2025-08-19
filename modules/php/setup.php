<?php
declare(strict_types=1);

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait SetupTrait
{
    use UtilsTrait;
    /**
     * This method is called only once, when a new game is launched. In this method, you must setup the game
     *  according to the game rules, so that the game is ready to be played.
     */
    protected function setupNewGame($players, $options = [])
    {
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];
        $this->createPlayers($players, $default_colors);
        $this->reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();
        $this->setupTokens();
    }

    protected function getAllDatas(): array
    {
        $result = [];

        // WARNING: We must only return information visible by the current player.
        $current_player_id = (int) $this->getCurrentPlayerId();

        // Get information about players.
        // NOTE: you can retrieve some extra field you added for "player" table in `dbmodel.sql` if you need it.
        $result["players"] = $this->getCollectionFromDb(
            "SELECT `player_id` `id`, `player_score` `score` FROM `player`"
        );

        foreach($result['players'] as $playerId => &$player) {
            $player['tokens'] = $this->getAllTokensForLocation((string)$playerId);
        }

        $result['seaTokens'] = $this->getAllTokensForLocation(SEA_LOCATION);

        // TODO: Gather all information about current game situation (visible by player $current_player_id).

        return $result;
    }

    function setupTokens()
    {
        $deck = array();
        foreach (TOKENS as $token) 
        {
            $typeVal = "{$token[1]}/{$token[2]}";
            $deck[] = array('type' => $typeVal, 'type_arg' => 1, 'nbr' => 1 );
        }
        $this->tokens->createCards($deck);
        $this->tokens->shuffle(BAG_LOCATION);
    }
}