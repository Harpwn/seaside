<?php
declare(strict_types=1);

trait DbTrait
{
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

    private function dbGetTokenFlipped($tokenId) : bool
    {
        //get flipped col from cards table by id 
        return $this->getUniqueValueFromDB("SELECT `flipped` FROM `card` WHERE `card_id` = $tokenId") == 1;
    }

    private function dbFlipToken(Token $token) {

        //Get opposite side value
        $tinyIntFlipped = $token->flipped ? 0 : 1;
        $tokenId = $token->id;
        //Set in DB
        $this->DbQuery("UPDATE `card` SET `flipped` = $tinyIntFlipped WHERE `card_id` = $tokenId");
    }
}