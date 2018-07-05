/**
 * Config class define the constants to be used in the project
 */
function Config() {

    // Definition of the colors to be used in 
    this.colors = {

        white: "#ffffff",
        gray: '#808080',
        darkGray: '#424242',
        lightGray: '#c0c0c0',

        orange: '#ff9b37',

        red: '#ff0000',
        darkRed: '#7c0000',
        freeSpeechRed: '#AB0206',

        green: '#00d020',
        darkGreen: '',

        purple: '#FE59FE',
        darkPurple: '#560056',

        yellow: '#FCFC00',
        lightYellow: '#ffff63',
        darkYellow: '#f5cd0f',

        cyan: '#00ffff',
        blue: '#0087ff',
        darkBlue: '#0000FF',
        lightBlue: '#36ccca',

        lightPink: '#FFAFAF',
        darkPink: '#FF59FF',
        lightBrown: '#7C5555',

        lightBlack: '#1E221E',
        black: '#000000',
        transparent: 'rgba(255,255,255,0.20)',
    }

    // O or 1 means inactive and active  - Color Changes
    this.states = {
        Initial: {
            1: { fill: this.colors.lightGray },
            0: { fill: this.colors.darkGray },
        },
        Block: {
            1: { fill: this.colors.purple }, // purple
            0: { fill: this.colors.darkPurple }, // dark purple
        },
        Occup: {
            1: { fill: this.colors.red }, // red
            0: { fill: this.colors.darkRed }, //  dark red
        },
        UnblockConf: {
            1: { fill: this.colors.lightPink },
            0: { fill: this.colors.lightBrown },
        },
        Route: {
            Grant: { fill: this.colors.green},
            Register: { fill: this.colors.orange },
            TimeLock: { fill: this.colors.blue },
            Requested: { fill: this.colors.yellow }
        }
    };

    this.statesSubElements = {
        Active: ['DerailmentDetecter'],
        Inhibit: ['DerailmentDetecter'],
        Block: ['Envelope'],
        FwdDir: ['Arrow'],
        BckDir: ['Arrow'],
        Occup: [''],
        SpeedCodeEn: [''],
        UnblockConf: [''],
        Confault: ['Fault'],
        Fault: ['Fault'],
        LocalCtrl: ['ManualMode'],
        LocalCtrlReq: ['ManualMode'],
        ManualMode: ['ManualMode'],
        ManualMode3rd: ['ManualMode'],
        ManualModeFrog: ['ManualMode'],
        ManualModeReq: ['ManualMode'],
        ManualModeReq3rd: ['ManualMode'],
        ManualModeReqFrog: ['ManualMode'],
        Switch1Locked: ['ManualMode'],
        Frog1Fault: ['Indication'],
        Frog1Normal: ['Indication'],
        Frog1Reverse: ['Indication'],
        Normal: [''],
        Reverse: [''],
        LeftSwitchFrog2Reverse: ['Indication'],
        RightSwitchFrog2Reverse: ['Indication'],
        LeftSwitchFrog2Normal: ['Indication'],
        RightSwitchFrog2Normal: ['Indication'],
        LeftSwitchFrog1Reverse: ['Indication'],
        RightSwitchFrog1Reverse: ['Indication'],
        LeftSwitchFrog1Normal: ['Indication'],
        RightSwitchFrog1Normal: ['Indication'],
        RightSwitch2Locked: ['ManualMode'],
        RightSwitch1Locked: ['ManualMode'],
        LeftSwitch1Locked: ['ManualMode'],
        LeftSwitch2Locked: ['ManualMode'],
        DCFault: ['House']
    }

    this.size = {
        proportion: 6,
        separator: 4,
        width: 42
    }

    this.track = {
        1: {
            x: 50,
            y: 200,
        },
        2: {
            x: 50,
            y: 161,
        },
        3: {
            x: 10,
            y: 122,
        },
        4: {
            x: 10,
            y: 83,
        },
        5: {
            x: 10,
            y: 44,
        },
        0: {
            x: 10,
            y: 239,
        },
    }

    this.positions = {
        0: 0,
        1: 90,
        2: 200,
        3: 200,
        4: 220,
        5: 300,
        6: 325,
        7: 320,
        8: 325,
        9: 325,
        10: 325,
        11: 475,
        12: 350,
        13: 350,
        14: 350,
        15: 400,
    }

    // The default size of each element
    this.widthElements = {
        Switch: 42,
        WT: 53,
        SBA: 80,
        DD: 5
    }


    this.house = {
        count: 0,
        name: {
            '0_WT': 'R1',
            '7_WT': 'R2',
            '13_WT': 'R3',
            '21_WT': 'R4',
            '29_WT': 'R5',
            '35_WT': 'R6',
            '45_WT': 'R7',
            '53_WT': 'R8',
            '64_WT': 'R9',
            '76_WT': 'R10',
            '85_WT': 'R11',
            '94_WT': 'R12',
            '105_WT': 'R13',
            '113_WT': 'R14',
            '121_WT': 'R15',
            '130_WT': 'R16',
            '139_WT': 'R15',
            '149_WT': 'R15',
            '157_WT': 'R15',
            '170_WT': 'R15',
            '182_WT': 'R15',
            '193_WT': 'R15',
            '201_WT': 'R15',
            '209_WT': 'R15',
            '216_WT': 'R15',
            '224_WT': 'R15',
        },
    }
    this.switchs = ["CV03C", "SW03T", "CV03B", "TE01", "TE02", "SW02T", "SW01T", "TE", "TE_TE02T", "TE04", "TE03"];

    this.specificCase = {
        "37_TE02": { direction: 'right' },
        "209_TE01": { direction: 'right' },
        "270_TE01": { direction: 'left' },
        "462_TE01": { direction: 'left' },
        "45_TE01": { direction: 'left' },
        "76_WT": { flag: 1 },
        "85_WT": { flag: 1 },
        "209_SW03T": { direction: 'right' },
        "209_TE01": { direction: 'left' },
        "209_CDV2_2D1T": { width: 50 },
        "209_TE": { direction: 'left' },
        //"473_CV03C": { name: '473_SWCAR03' },
        //"473_CV02C": { name: '473_CAR02' },
        "504_TE02": { direction: 'right' },
        "518_TE02": { direction: 'right' },
        "562_TE01": { direction: 'left' },
        "571_WT": { flag: 1 },
        "621_TE02": { direction: 'right' },
        // "717_CDV_3D1T": { track: 1},
        "805_SW02T": { position: 'top', direction: 'left'},
        "717_SW02T": {direction: 'left'},
        "830_SW03T": { direction: 'right' },
        "819_TE01": { position: 'top', direction: 'right' },
        "858_SW01T": { position: 'bottom', direction: 'left', track: 5, after: '858_CDV_2D1T' },
        "858_CDV_1D1T_RFSP": { track: 5, after: '858_SW02T' },
        "858_CDV_1D2T_RFSP": { track: 5, after: '858_TE01' },
        "858_SW02T": { direction: 'left' },
        "858_WT": { flag: 1 },
        "858_CDV_3D1T": { after: '858_WTII' },
        "858_CDV_3E1T": { after: '858_WT' },
        "863_CDV_DD2": { track: 3 },
        "885_CV03B": { position: 'top', direction: 'right', track: 1 },
        "875_SW01T": { position: 'top'}
        //"888|WT": {track: 0},
    }

    this.specificCaseRoute = {
        "852_RSLZ02III": { elements: ["852_SW01T"]},
        "858_RII_AD": { elements: ["858_WTII", "858_CDV_3D1T"] },
        "858_RCAR02III": { elements: ["858_SW02T", "858_CDV_3E1T"] },
        "858_RCAR03IV": { elements: ["858_SW03T", "858_PARKIV_AUX", "852_PARKIV"] },
        "858_RCAR03III": { elements: ["858_SW03T", "858_PARKIII_AUX", "852_PARKIII"] },
        "858_RCARIV03": { elements: ["858_SW03T"] },
        "863_RCAR01II": { elements: ["863_CV03C"] },
        "858_R_AB_RFSP": { elements: ["858_CDV_1D1T_RFSP", "858_CDV_1D2T_RFSP"]},
        "858_R_BA_RFSP": { elements: ["858_CDV_3D1T"] },
        "858_R_CB_RFSP": { elements: ["858_SW01T", "858_CDV_1D1T_RFSP", "858_CDV_1D2T_RFSP"] },
        "858_R_BC_RFSP": { elements: ["858_SW01T", "858_CDV_3E1T"] },
        "858_RII_CD": { elements: ["858_WTII", "858_CDV_3D1T"]},
    }


    // Fill Dark Gray Color: #404040 Inactive state
    // Fill Light Gray Color: #c0c0c0 Active State
    // Fill Orange Color: #ff9b37
    // Fill Red Color: #ff0000
    // Fill Dark Red Color: #7c0000
    // Fill Green Color: #00d020
    // Fill Purple Color: #9d4874
    // Fill Dark Purple Color: #560056
    // Fill Blue Color: #0087ff
    // Fill Dark Blue Color: #0000d4

    // Border Gray Color: #808080
    // Border Yellow Color: #ffed48
    // Border Purple Color: #9d4874

    // -- Scale? in px
    // width="40"; 
    // height="65"; 
}

window.mainConfig = new Config();