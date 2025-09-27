const LevelThemes = {
    GARDEN: {
        id: 'garden',
        name: 'Garden',
        backgroundColor: '#87CEEB',
        obstacles: ['gnome_foot', 'flower_pot', 'mushroom', 'rock', 'acorn', 'ant_hill'],
        description: 'Race through a backyard garden filled with natural obstacles'
    },
    LIVING_ROOM: {
        id: 'living_room',
        name: 'Living Room',
        backgroundColor: '#D2B48C',
        obstacles: ['sofa', 'tv', 'chair', 'table'],
        description: 'Navigate through household furniture'
    },
    BACKYARD: {
        id: 'backyard',
        name: 'Backyard',
        backgroundColor: '#87CEEB',
        obstacles: ['lawnmower', 'gnome_foot', 'flower_pot', 'rock'],
        description: 'Outdoor racing with garden equipment'
    },
    BEACH: {
        id: 'beach',
        name: 'Beach',
        backgroundColor: '#87CEEB',
        obstacles: ['crab', 'sandcastle', 'float'],
        description: 'Sandy beach racing'
    }
};

console.log('LevelThemes loaded:', LevelThemes);