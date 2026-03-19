<?php

declare(strict_types=1);

namespace Bga\Games\Seaside\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Seaside\Game;

class PreEndGame extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: GAME_STATE_PRE_END_GAME,
            type: StateType::GAME,
            name: 'preEndGame',
            description: clienttranslate('Prepare for end of game'),
            updateGameProgression: true,
            transitions: [
                TRANSITION_SCORING_STARTED => GAME_STATE_END_GAME_SCORING,
            ],
        );
    }

    public function onEnteringState(): string
    {
        $seaTokens = $this->game->getAllTokensForLocation(SEA_LOCATION);
        if (count($seaTokens) > 0) {
            $this->handleEndGameWaveBonus($seaTokens);
        }
        return TRANSITION_SCORING_STARTED;
    }

    private function handleEndGameWaveBonus(array $seaTokens): void
    {
        $playerWaveCounts = [];
        foreach ($this->game->getPlayersIds() as $playerId) {
            $playerWaves = $this->game->getAllTokensOfTypeForLocation((string)$playerId, WAVE);
            $playerWaveCounts[$playerId] = count($playerWaves);
        }

        $mostWaves = max($playerWaveCounts);

        if ($mostWaves == 0) {
            return;
        }

        $playersWithMostWaves = array_keys($playerWaveCounts, $mostWaves);

        if (count($playersWithMostWaves) == 1) {
            $this->game->sendTokensToPlayerArea($seaTokens, $playersWithMostWaves[0]);
            $this->nfEndGameWaveBonus($playersWithMostWaves[0], $seaTokens);
            $this->game->incStat(count($seaTokens), STAT_NO_SEATOKENS, $playersWithMostWaves[0]);
        } else if (count($playersWithMostWaves) > 1) {
            $playerIdsAndTokens = [];
            $tokensPerPlayer = intdiv(count($seaTokens), count($playersWithMostWaves));
            foreach ($playersWithMostWaves as $playerId) {
                $tokensForPlayer = array_splice($seaTokens, 0, $tokensPerPlayer);
                $this->game->sendTokensToPlayerArea($tokensForPlayer, (int)$playerId);
                $playerIdsAndTokens[$playerId] = $tokensForPlayer;
                $this->game->incStat(count($tokensForPlayer), STAT_NO_SEATOKENS, $playerId);
            }
            $this->nfEndGameWaveBonusTie($playerIdsAndTokens);
        }
    }

    private function nfEndGameWaveBonus(int $playerId, array $seaTokens): void
    {
        $this->game->notify->all("endGameWaveBonus", clienttranslate('🏅 ${player_name} has the most ${waveEmoji} waves, so they get the ${tokenCount} leftover sea tokens'), [
            "player_id" => $playerId,
            "tokenCount" => count($seaTokens),
            "tokens" => $seaTokens,
            "waveEmoji" => $this->game->getEmojiForType('WAVE')
        ]);
    }

    private function nfEndGameWaveBonusTie(array $playerIdsAndTokens): void
    {
        $playerIds = array_keys($playerIdsAndTokens);
        $playerNames = array_map(fn($id) => $this->game->getPlayerNameById((int)$id), $playerIds);
        $this->game->notify->all("endGameWaveBonusTie", clienttranslate('🏅 ${playerNames} have tied for the most ${waveEmoji} waves, so they each get ${tokenCount} leftover sea tokens'), [
            "playerIdsAndTokens" => $playerIdsAndTokens,
            "playerNames" => implode(',', array_values($playerNames)),
            "tokenCount" => count($playerIdsAndTokens[array_key_first($playerIdsAndTokens)]),
            "waveEmoji" => $this->game->getEmojiForType('WAVE')
        ]);
    }
}
