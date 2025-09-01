<?php

use Bga\GameFramework\GameStateBuilder;
use Bga\GameFramework\StateType;


$machinestates = [
    GAME_STATE_GAME_SETUP => GameStateBuilder::gameSetup(GAME_STATE_PLAYER_PLAY_TOKEN)->build(), 

    GAME_STATE_PLAYER_PLAY_TOKEN => GameStateBuilder::create()
        ->name('playToken')
        ->description(clienttranslate('${actplayer} must choose a side to play'))
        ->descriptionmyturn(clienttranslate('${you} must choose a side to play'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args('argPlayToken')
        ->possibleactions([
            'actPlayToken',
        ])
        ->transitions([
            TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
            TRANSITION_PLAY_AGAIN => GAME_STATE_PLAYER_PLAY_AGAIN,
            TRANSITION_STEAL_CRAB => GAME_STATE_PLAYER_ROCK_STEAL_CRAB,
            TRANSITION_FLIP_BEACH => GAME_STATE_PLAYER_WAVE_FLIP_BEACH,
            TRANSITION_SELECT_ISOPODS => GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS
        ]) 
        ->build(),

    GAME_STATE_PLAYER_ROCK_STEAL_CRAB => GameStateBuilder::create()
        ->name('stealCrab')
        ->description(clienttranslate('${actplayer} must steal a crab from another player'))
        ->descriptionmyturn(clienttranslate('${you} must steal a crab from another player'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args('argStealCrab')
        ->possibleactions([
            'actStealCrab',
        ])
        ->transitions([
            TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
        ]) 
        ->build(),

    GAME_STATE_PLAYER_WAVE_FLIP_BEACH => GameStateBuilder::create()
        ->name('flipBeach')
        ->description(clienttranslate('${actplayer} must flip a beach'))
        ->descriptionmyturn(clienttranslate('${you} must flip a beach'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args('argFlipBeach')
        ->possibleactions([
            'actFlipBeach',
        ])
        ->transitions([
            TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
            TRANSITION_PLAY_AGAIN => GAME_STATE_PLAYER_PLAY_AGAIN,
            TRANSITION_STEAL_CRAB => GAME_STATE_PLAYER_ROCK_STEAL_CRAB,
            TRANSITION_FLIP_BEACH => GAME_STATE_PLAYER_WAVE_FLIP_BEACH,
            TRANSITION_SELECT_ISOPODS => GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS,
        ]) 
        ->build(),

    GAME_STATE_PLAYER_SANDPIPER_SELECT_ISOPODS => GameStateBuilder::create()
        ->name('selectIsopods')
        ->description(clienttranslate('${actplayer} may take isopods from the sea'))
        ->descriptionmyturn(clienttranslate('${you} may take isopods from the sea'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args('argSelectIsopods')
        ->possibleactions([
            'actSelectIsopods',
        ])
        ->transitions([
            TRANSITION_END_TURN => GAME_STATE_NEXT_PLAYER,
        ]) 
        ->build(),

    GAME_STATE_NEXT_PLAYER => GameStateBuilder::create()
        ->name('nextPlayer')
        ->description('')
        ->type(StateType::GAME)
        ->action('stNextPlayer')
        ->updateGameProgression(true)
        ->transitions([
            TRANSITION_END_SCORE => GAME_STATE_PRE_END_GAME,
            TRANSITION_NEXT_PLAYER => GAME_STATE_PLAYER_PLAY_TOKEN
        ]) 
        ->build(),

    GAME_STATE_PLAYER_PLAY_AGAIN => GameStateBuilder::create()
        ->name('playAgain')
        ->description(clienttranslate('${actplayer} must play again'))
        ->descriptionmyturn(clienttranslate('${you} must play again'))
        ->type(StateType::ACTIVE_PLAYER)
        ->action('stPlayAgain')
        ->transitions([
            TRANSITION_PLAY_TOKEN => GAME_STATE_PLAYER_PLAY_TOKEN,
            TRANSITION_END_SCORE => GAME_STATE_PRE_END_GAME,
        ])
        ->build(),

    GAME_STATE_PRE_END_GAME => GameStateBuilder::create()
        ->name('preEndGame')
        ->description(clienttranslate('Prepare for end of game'))
        ->type(StateType::GAME)
        ->action('stPreEndGame')
        ->updateGameProgression(true)
        ->transitions([
            TRANSITION_SCORING_FINISHED => GAME_STATE_END_GAME,
        ])
        ->build(),
];