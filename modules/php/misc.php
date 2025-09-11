<?php
declare(strict_types=1);

/**
 * @property \Bga\GameFramework\Components\Deck $tokens
 */
trait MiscTrait
{
    use DebugUtilsTrait;

    public function getGameProgression()
    {
        // get tokens left in deck
        $tokens_locations = $this->tokens->countCardsInLocations();
        $deck_tokens_count = $tokens_locations[BAG_LOCATION] ?? 0;
        $total_tokens_count = array_sum($tokens_locations);

        return ($total_tokens_count - $deck_tokens_count) / $total_tokens_count * 100;
    }

    
    public function zombieTurn(array $state, int $active_player): void
    {
        //LEVEL 1: Random Zombie
        $stateName = $state["name"];

        if ($state["type"] === "activeplayer") {
            $this->autoplay_state($stateName);
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$stateName}\".");
    }

    /**
     * Migrate database.
     *
     * You don't have to care about this until your game has been published on BGA. Once your game is on BGA, this
     * method is called everytime the system detects a game running with your old database scheme. In this case, if you
     * change your database scheme, you just have to apply the needed changes in order to update the game database and
     * allow the game to continue to run with your new version.
     *
     * @param int $from_version
     * @return void
     */
    public function upgradeTableDb($from_version)
    {
        //       if ($from_version <= 1404301345)
        //       {
        //            // ! important ! Use `DBPREFIX_<table_name>` for all tables
        //
        //            $sql = "ALTER TABLE `DBPREFIX_xxxxxxx` ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
        //
        //       if ($from_version <= 1405061421)
        //       {
        //            // ! important ! Use `DBPREFIX_<table_name>` for all tables
        //
        //            $sql = "CREATE TABLE `DBPREFIX_xxxxxxx` ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
    }
}
