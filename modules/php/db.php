<?php

trait DbTrait
{
    private function createPlayers($players, $default_colors)
    {
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "')";
        }
        $sql .= implode(',', $values);
        $this->DbQuery($sql);
    }

    private function dbFlipToken(Token $token) {
        // bool as tinyiny
        $tinyIntFlipped = $token->flipped ? 1 : 0;
        $tokenId = $token->id;
        $this->DbQuery("UPDATE token SET `flipped` = $tinyIntFlipped WHERE `card_id` = $tokenId");
    }
}