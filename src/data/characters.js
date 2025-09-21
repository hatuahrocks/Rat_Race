const Characters = [
    {
        id: 'butter',
        name: 'Butter',
        primaryColor: '#F8E6A0',
        secondaryColor: '#F8E6A0',
        description: 'Creamy yellow speedster',
        personality: 'The cheerful underdog',
        trait: 'Sweet, friendly, optimistic racer',
        accessory: 'bow-tie',
        accessoryColor: '#FF0000'
    },
    {
        id: 'duke',
        name: 'Duke',
        primaryColor: '#8D8D93',
        secondaryColor: '#FFFFFF',
        description: 'Grey and white champion',
        personality: 'Distinguished gentleman racer',
        trait: 'Sophisticated, experienced veteran',
        accessory: 'monocle-tophat',
        accessoryColor: '#000000'
    },
    {
        id: 'daisy',
        name: 'Daisy',
        primaryColor: '#8A4FFF',
        secondaryColor: '#FFFFFF',
        description: 'Purple racing princess',
        personality: 'Racing princess',
        trait: 'Confident, stylish speedster',
        accessory: 'tiara',
        accessoryColor: '#FFD700'
    },
    {
        id: 'pip',
        name: 'Pip',
        primaryColor: '#111111',
        secondaryColor: '#FFFFFF',
        description: 'Black and white',
        personality: 'The wild card',
        trait: 'Mischievous trickster, agile',
        accessory: 'goggles',
        accessoryColor: '#FF0000'
    },
    {
        id: 'biscuit',
        name: 'Biscuit',
        primaryColor: '#8B5A2B',
        secondaryColor: '#FFFFFF',
        description: 'Brown and white',
        personality: 'Rough-and-tumble racer',
        trait: 'Tough, determined competitor',
        accessory: 'vest',
        accessoryColor: '#000000'
    },
    {
        id: 'slurp',
        name: 'Slurp',
        primaryColor: '#C8A27E',
        secondaryColor: '#C8A27E',
        description: 'Light brown racer',
        personality: 'The cool one',
        trait: 'Laid-back, smooth operator',
        accessory: 'sunglasses',
        accessoryColor: '#000000'
    },
    {
        id: 'dippy',
        name: 'Dippy',
        primaryColor: '#A76B3B',
        secondaryColor: '#A76B3B',
        description: 'Medium brown speedster',
        personality: 'Eager newcomer',
        trait: 'Energetic, enthusiastic rookie',
        accessory: 'sweatband',
        accessoryColor: '#FF0000'
    },
    {
        id: 'marshmallow',
        name: 'Marshmallow',
        primaryColor: '#FFFFFF',
        secondaryColor: '#FFFFFF',
        description: 'Pure white racer',
        personality: 'Soft but speedy',
        trait: 'Gentle giant, surprisingly fast',
        accessory: 'scarf',
        accessoryColor: '#4169E1'
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