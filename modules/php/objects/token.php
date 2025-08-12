<?php

class Token
{
    public int $id;

    public int $type;

    public string $side1;
    public string $side2;

    public string $location;

    /** 
     * 0 - Main, Unpiled
     * 1 - 10 - Reservered For Rock Pairs
     * 11+ - Reserved for Sandpiper/Isopod piles
     */
    public int $locationArg;

    /**
     * false: side1
     * true: side2
     */
    public bool $flipped;

    public function __construct($dbCard, bool $flipped = null)
    {
        $this->id = intval($dbCard['card_id']);
        $this->location = $dbCard['card_location'];
        $this->locationArg = intval($dbCard['card_location_arg']);
        $this->type = intval($dbCard['card_type']);
        $this->side1 = intval($dbCard['side1']);
        $this->side2 = intval($dbCard['side2']);

        if ($flipped === null) {
            $this->flipped = $dbCard['card_flipped'] == 1;
        } else {
            $this->flipped = $flipped;
        }
    }

    public function getSide()
    {
        if ($this->flipped) {
            return $this->side2;
        }
        return $this->side1;
    }
}
