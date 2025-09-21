const Characters = [
    {
        id: 'butter',
        name: 'Butter',
        primaryColor: '#F8E6A0',
        secondaryColor: '#F8E6A0',
        hasPatches: false,
        description: 'Creamy yellow speedster'
    },
    {
        id: 'duke',
        name: 'Duke',
        primaryColor: '#8D8D93',
        secondaryColor: '#FFFFFF',
        hasPatches: false,
        description: 'Grey and white champion'
    },
    {
        id: 'daisy',
        name: 'Daisy',
        primaryColor: '#8A4FFF',
        secondaryColor: '#FFFFFF',
        hasPatches: false,
        description: 'Purple racing princess'
    },
    {
        id: 'pip',
        name: 'Pip',
        primaryColor: '#111111',
        secondaryColor: '#FFFFFF',
        hasPatches: true,
        description: 'Black with white patches'
    },
    {
        id: 'biscuit',
        name: 'Biscuit',
        primaryColor: '#8B5A2B',
        secondaryColor: '#FFFFFF',
        hasPatches: true,
        description: 'Brown with white patches'
    },
    {
        id: 'slurp',
        name: 'Slurp',
        primaryColor: '#C8A27E',
        secondaryColor: '#C8A27E',
        hasPatches: false,
        description: 'Light brown racer'
    },
    {
        id: 'dippy',
        name: 'Dippy',
        primaryColor: '#A76B3B',
        secondaryColor: '#A76B3B',
        hasPatches: false,
        description: 'Medium brown speedster'
    },
    {
        id: 'marshmallow',
        name: 'Marshmallow',
        primaryColor: '#FFFFFF',
        secondaryColor: '#FFFFFF',
        hasPatches: false,
        description: 'Pure white racer'
    }
];

const LevelThemes = {
    LIVING_ROOM: {
        id: 'living_room',
        name: 'Living Room',
        backgroundColor: '#E6D7C3',
        obstacles: ['sofa', 'tv', 'chair', 'table'],
        ramps: ['book', 'cushion']
    },
    KITCHEN: {
        id: 'kitchen',
        name: 'Kitchen',
        backgroundColor: '#F0E6D2',
        obstacles: ['table_leg', 'vacuum', 'food'],
        ramps: ['cutting_board', 'pot_lid']
    },
    BACKYARD: {
        id: 'backyard',
        name: 'Backyard',
        backgroundColor: '#87CEEB',
        obstacles: ['lawnmower', 'hose', 'sprinkler'],
        ramps: ['dirt_mound', 'garden_tool']
    },
    POOL: {
        id: 'pool',
        name: 'Pool Area',
        backgroundColor: '#00CED1',
        obstacles: ['float', 'chair', 'crab'],
        ramps: ['diving_board', 'inflatable']
    },
    BEACH: {
        id: 'beach',
        name: 'Beach',
        backgroundColor: '#FFE4B5',
        obstacles: ['sandcastle', 'crab', 'shell'],
        ramps: ['dune', 'surfboard']
    }
};