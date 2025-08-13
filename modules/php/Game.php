<?php
declare(strict_types=1);
namespace Bga\Games\Seaside;

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

require_once('objects/token.php');
require_once('constants.inc.php');
require_once('utils.php');
require_once('actions.php');
require_once('states.php');
require_once('args.php');
require_once('debug-utils.php');
require_once('logic.php');
require_once('setup.php');
require_once('notifications.php');
require_once('misc.php');
require_once('db.php');

require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class Game extends \Bga\GameFramework\Table
{
    use \UtilsTrait;
    use \ActionTrait;
    use \StatesTrait;
    use \ArgsTrait;
    use \DebugUtilsTrait;
    use \MiscTrait;
    use \SetupTrait;
    use \NotificationsTrait;
    use \DbTrait;
    use \LogicTrait;

    private \Bga\GameFramework\Components\Deck $tokens;

    public function __construct()
    {
        parent::__construct();

        $this->initGameStateLabels([]);
        $this->addPlayerNameDecorator();

        $this->tokens = $this->getNew("module.common.deck");
        $this->tokens->init("card");
    }
}