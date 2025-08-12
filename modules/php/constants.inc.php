<?php

const SANDPIPER = 'SANDPIPER';
const BEACH = 'BEACH';
const SHELL = 'SHELL';
const WAVE = 'WAVE';
const ISOPOD = 'ISOPOD';
const CRAB = 'CRAB';
const ROCK = 'ROCK';

const SEA_LOCATION = "SEA";

const SANDPIPER_PILE_INIT = 100;
const ROCK_PILE_INIT = 1;

const TOKENS = [
    65 => [ 1 => BEACH, 2 => SANDPIPER ],
    66 => [ 1 => BEACH, 2 => SANDPIPER ],
    67 => [ 1 => BEACH, 2 => SANDPIPER ],
    1 => [ 1 => BEACH, 2 => ISOPOD ],
    2 => [ 1 => BEACH, 2 => ISOPOD ],
    3 => [ 1 => BEACH, 2 => ISOPOD ],
    17 => [ 1 => BEACH, 2 => CRAB ],
    18 => [ 1 => BEACH, 2 => CRAB ],
    38 => [ 1 => BEACH, 2 => ROCK ],
    39 => [ 1 => BEACH, 2 => ROCK ],
    40 => [ 1 => BEACH, 2 => ROCK ],
    41 => [ 1 => BEACH, 2 => ROCK ],
    42 => [ 1 => BEACH, 2 => SHELL ],
    43 => [ 1 => BEACH, 2 => SHELL ],
    44 => [ 1 => BEACH, 2 => SHELL ],
    45 => [ 1 => BEACH, 2 => SHELL ],
    8 => [ 1 => BEACH, 2 => WAVE ],
    9 => [ 1 => BEACH, 2 => WAVE ],
    10 => [ 1 => BEACH, 2 => WAVE ],
    11 => [ 1 => BEACH, 2 => WAVE ],
    12 => [ 1 => BEACH, 2 => WAVE ],
    13 => [ 1 => BEACH, 2 => WAVE ],

    60 => [ 1 => SANDPIPER, 2 => ISOPOD ],
    61 => [ 1 => SANDPIPER, 2 => ISOPOD ],
    62 => [ 1 => SANDPIPER, 2 => ISOPOD ],
    63 => [ 1 => SANDPIPER, 2 => ISOPOD ],
    64 => [ 1 => SANDPIPER, 2 => ISOPOD ],
    68 => [ 1 => SANDPIPER, 2 => CRAB ],
    69 => [ 1 => SANDPIPER, 2 => CRAB ],
    70 => [ 1 => SANDPIPER, 2 => CRAB ],
    26 => [ 1 => SANDPIPER, 2 => ROCK ],
    27 => [ 1 => SANDPIPER, 2 => ROCK ],
    46 => [ 1 => SANDPIPER, 2 => SHELL ],
    47 => [ 1 => SANDPIPER, 2 => SHELL ],
    48 => [ 1 => SANDPIPER, 2 => SHELL ],
    49 => [ 1 => SANDPIPER, 2 => SHELL ],
    
    14 => [ 1 => ISOPOD, 2 => CRAB ],
    15 => [ 1 => ISOPOD, 2 => CRAB ],
    16 => [ 1 => ISOPOD, 2 => CRAB ],
    31 => [ 1 => ISOPOD, 2 => ROCK ],
    32 => [ 1 => ISOPOD, 2 => ROCK ],
    50 => [ 1 => ISOPOD, 2 => SHELL ],
    51 => [ 1 => ISOPOD, 2 => SHELL ],
    52 => [ 1 => ISOPOD, 2 => SHELL ],
    53 => [ 1 => ISOPOD, 2 => SHELL ],
    4 => [ 1 => ISOPOD, 2 => WAVE ],
    5 => [ 1 => ISOPOD, 2 => WAVE ],
    6 => [ 1 => ISOPOD, 2 => WAVE ],
    7 => [ 1 => ISOPOD, 2 => WAVE ],

    33 => [ 1 => CRAB, 2 => ROCK ],
    34 => [ 1 => CRAB, 2 => ROCK ],
    35 => [ 1 => CRAB, 2 => ROCK ],
    36 => [ 1 => CRAB, 2 => ROCK ],
    37 => [ 1 => CRAB, 2 => ROCK ],
    57 => [ 1 => CRAB, 2 => SHELL ],
    58 => [ 1 => CRAB, 2 => SHELL ],
    59 => [ 1 => CRAB, 2 => SHELL ],
    19 => [ 1 => CRAB, 2 => WAVE ],
    20 => [ 1 => CRAB, 2 => WAVE ],
    21 => [ 1 => CRAB, 2 => WAVE ],
    22 => [ 1 => CRAB, 2 => WAVE ],

    28 => [ 1 => ROCK, 2 => SHELL ],
    29 => [ 1 => ROCK, 2 => SHELL ],
    30 => [ 1 => ROCK, 2 => SHELL ],
    23 => [ 1 => ROCK, 2 => WAVE ],
    24 => [ 1 => ROCK, 2 => WAVE ],
    25 => [ 1 => ROCK, 2 => WAVE ],

    54 => [ 1 => SHELL, 2 => WAVE ],
    55 => [ 1 => SHELL, 2 => WAVE ],
    56 => [ 1 => SHELL, 2 => WAVE ],
];

?>