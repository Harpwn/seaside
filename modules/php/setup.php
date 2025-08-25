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
        $defaultColors = $gameinfos['player_colors'];
        $this->createPlayers($players, $defaultColors);
        $this->reattributeColorsBasedOnPreferences($players, $defaultColors);
        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();
        $this->setupTokens();

        $this->initStat('player', 'no_crab', 0);
        $this->initStat('player', 'no_rock', 0);
        $this->initStat('player', 'no_wave', 0);
        $this->initStat('player', 'no_beach', 0);
        $this->initStat('player', 'no_shell', 0);
        $this->initStat('player', 'no_isopod', 0);
        $this->initStat('player', 'no_sandpiper', 0);
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

        foreach($result['players'] as $playerId => &$player) {
            $player['tokens'] = $this->getAllTokensForLocation((string)$playerId);
        }

        $result['seaTokens'] = $this->getAllTokensForLocation(SEA_LOCATION);

        $result['deckRemainingCount'] = $this->tokens->countCardsInLocation(BAG_LOCATION);

        // TODO: Gather all information about current game situation (visible by player $currentPlayerId).

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

        // get number of players
        $numPlayers = count($this->getPlayersIds());
        switch ($numPlayers) {
            case 2:
                // Remove 30-40 tokens
                $this->removeNoTokens(rand(30, 40));
                break;
            case 3:
                // Remove 15-20 tokens
                $this->removeNoTokens(rand(15, 20));
                break;
            case 4:
            case 5:
                //All Tokens Used
                break;
            default:
                throw new \feException("Invalid number of players: {$numPlayers}");
        }
    }
}