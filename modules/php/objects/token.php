<?php

class Token
{
    public int $id;

    public string $type;
    public string $location;

    /** 
     * 0 - Main, Unpiled
     * 1 - 10 - Reservered For Rock Pairs
     * 100+ - Reserved for Sandpiper/Isopod piles
     */
    public int $locationArg;

    public bool $flipped;

    public function __construct($dbCard)
    {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->locationArg = intval($dbCard['location_arg']);
        $this->type = (string)$dbCard['type'];
    }

    public function getActiveType(bool $flipped): string
    {
        //split $type by /
        $types = explode('/', $this->type);
        if($flipped) {
            return $types[1];
        }

        return $types[0];
    }
}
