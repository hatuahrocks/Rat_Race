// Track themes. Each theme carries its obstacle set plus the full palette
// LevelManager needs to build the environment (gradients + scenery type).
// `preview` colors are used by TrackSelectionScene to draw the picker cards.
const LevelThemes = {
    GARDEN: {
        id: 'garden',
        name: 'Garden',
        description: 'Sunny backyard with fences,\nhedges and flowers',
        obstacles: ['gnome_foot', 'flower_pot', 'mushroom', 'rock', 'acorn', 'ant_hill'],
        backgroundColor: '#87CEEB',
        preview: { sky: '#6FBDEF', band: '#7CB342', shoulder: '#8A7050', road: '#484C50' },
        palette: {
            sky: [[0, '#4FACE9'], [0.55, '#8ED1F7'], [1, '#D9F2FF']],
            bandTop: [[0, '#94C946'], [1, '#6FA834']],
            foreground: [[0, '#6FA834'], [1, '#3F6B1D']],
            dirtHigh: [[0, '#A18560'], [1, '#7C654A']],
            dirtLow: [[0, '#8A7050'], [1, '#6E5840']],
            road: [[0, '#565A5E'], [0.5, '#484C50'], [1, '#3E4246']],
            spotColor: 0x55432F,
            dustColor: 0x654321,
            sun: true,
            clouds: true
        }
    },
    BEACH: {
        id: 'beach',
        name: 'Beach',
        description: 'Seaside boardwalk with\nwaves, palms and sand',
        obstacles: ['crab', 'sandcastle', 'float', 'rock'],
        backgroundColor: '#87CEEB',
        preview: { sky: '#5BC2EF', band: '#2E93CF', shoulder: '#E0C588', road: '#5E6266' },
        palette: {
            sky: [[0, '#3FA7E8'], [0.6, '#8FD4F7'], [1, '#E8F7FF']],
            bandTop: [[0, '#1E88C7'], [1, '#56B5E3']],          // the ocean
            foreground: [[0, '#E8D196'], [1, '#C2A468']],        // dry sand
            dirtHigh: [[0, '#EBD49C'], [1, '#CDB075']],          // wet sand shoulders
            dirtLow: [[0, '#DEC288'], [1, '#BC9C62']],
            road: [[0, '#63676B'], [0.5, '#54585C'], [1, '#484C50']],
            spotColor: 0xA98D5E,
            dustColor: 0xCBB279,
            sun: true,
            clouds: true
        }
    },
    LIVING_ROOM: {
        id: 'living_room',
        name: 'Living Room',
        description: 'Indoor sprint across the\nhardwood floor',
        obstacles: ['sofa', 'tv', 'chair', 'table'],
        backgroundColor: '#D2B48C',
        preview: { sky: '#C9B29A', band: '#EDE3D2', shoulder: '#9E5A4A', road: '#A8794F' },
        palette: {
            sky: [[0, '#C9B29A'], [1, '#B49C82']],               // wallpaper
            bandTop: [[0, '#F0E7D8'], [1, '#D9CCB4']],           // wainscot paneling
            foreground: [[0, '#8C4F40'], [1, '#62352A']],        // rug
            dirtHigh: [[0, '#A85F4E'], [1, '#86473A']],          // rug border shoulders
            dirtLow: [[0, '#9E5847'], [1, '#7C4234']],
            road: [[0, '#B98A5E'], [0.5, '#A8794F'], [1, '#946845']], // floorboards
            spotColor: 0x6E3D31,
            dustColor: 0x8A8A8A,
            sun: false,
            clouds: false
        }
    }
};
