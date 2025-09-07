<?php

class Token
{
    public int $id;
    public string $side1;
    public string $side2;
    public string $activeType;
    public string $inactiveType;
    public string $location;
    public bool $flipped;

    /** 
     * 0 - Main, Unpiled
     * 1 - 10 - Reservered For Rock Pairs
     * 100+ - Reserved for Sandpiper/Isopod piles
     */
    public int $locationArg;

    public function __construct($dbCard, $flipped)
    {
        $types = explode('/', $dbCard['type']);
        $this->side1 = $types[0];
        $this->side2 = $types[1] ?? '';

        if($flipped) {
            $this->activeType = $this->side2;
            $this->inactiveType = $this->side1;
        } else {
            $this->activeType = $this->side1;
            $this->inactiveType = $this->side2;
        }

        $this->flipped = $flipped;
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->locationArg = intval($dbCard['location_arg']);
    }
}
