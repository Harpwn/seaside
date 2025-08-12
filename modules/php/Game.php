<?php
declare(strict_types=1);

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Seaside implementation : © Harry B - Hbill1337@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

class Game extends \Bga\GameFramework\Table
{
    use UtilsTrait;
    use ActionTrait;
    use StatesTrait;
    use ArgsTrait;
    use DebugUtilsTrait;
    use MiscTrait;
    use SetupTrait;
    use NotificationsTrait;
    use DbTrait;
    use LogicTrait;

    private \Bga\GameFramework\Components\Deck $tokens;

    public function __construct()
    {
        parent::__construct();

        $this->initGameStateLabels([]);
        $this->addPlayerNameDecorator();

        $this->tokens = $this->getNew("module.common.deck");
        $this->tokens->init("card");

        $this->setupTokens();
    }
}
