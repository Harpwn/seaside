<?php

class Token
{
    public int $id;
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
        //split $type by /
        $types = explode('/', $dbCard['type']);
        $this->activeType = $types[0];
        $this->inactiveType = $types[1] ?? '';
        if($flipped) {
            $this->activeType = $types[1];
            $this->inactiveType = $types[0];
        } else {
            $this->activeType = $types[0];
            $this->inactiveType = $types[1];
        }

        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->locationArg = intval($dbCard['location_arg']);
    }
}
