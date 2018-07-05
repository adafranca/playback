/*=============================================
=            Elements Section            =
=============================================*/
/**
 * Here we define all the elements that will be used to 
 * create the rail
 */

/**
 * Every element on the field descends from Element Class
 * @param {string} name the element name in rail
 * @param {number} track the track number
 */
function Element(name, track) {

    // Element name
    if (!name) name = this.constructor.name;
    this.name = name;

    // Track 1 or 2
    this.track = [];
    this.proportion = mainConfig.size.proportion;

    // Coordinates
    //if(!track) track=1;

    this.x = mainConfig.track[track].x;
    this.y = mainConfig.track[track].y;

    // Namespace and svg container
    this.svgContainer = document.getElementById('svgPrincipal');
    this.namespace = "http://www.w3.org/2000/svg";

    // All the states that an element can be
    this.states = [];

    // The active states to an element
    this.currentStates = [];

    // the shapes that compose the element
    this.shapes = [];

    this.width = 0;

    this.subElements = [];

    this.elG = null;

    this.train = null;

    // Default build method to create the shapes and add to the svg container
    this.build = function () {
        var key;

        // Create the g svg element to group all shapes that will be used in this element
        this.elG = document.createElementNS(this.namespace, 'g');
        this.elG.setAttribute('id', this.name);
        this.elG.setAttribute('class', "KM Location" + this.name.split("_")[0]);

        // Add all the shapes to the g svg element
        for (var i = 0; i < this.shapes.length; i++) {      // Iterates between all the shapes
            this.shapes[i].createShape();                 // Creates shape
            this.elG.appendChild(this.shapes[i].svgElement);
        }

        // Append the subElements to the g svg element
        for (i = 0; i < this.subElements.length; i++) {
            this.subElements[i].createElement();
            this.elG.appendChild(this.subElements[i].elG);
        }
        // and add the g svg element to the svg container
        this.svgContainer.appendChild(this.elG);

        var text = this.name.split("_")[1];

        if (this.name.split("_")[2])
            text = text + "_" + this.name.split("_")[2];

        $(this.elG).qtip({
            content: {
                text: text
            }
        });

    }

    /**
     * Default function to addState to the elements
     * @param {string} newState the new state to be added to the element
     * @returns {boolean} the confirmation 
     */
    this.addState = function (newState) {

        // Check if a new state was passed as parameter
        if (!newState) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg: The new state wasn\'t set.');
            return false;
        }

        // Check if the new state is in the possible states list
        if (this.states.indexOf(newState) === -1) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg: The state ' + newState + 'is not valid for this element.');
            return false;
        }

        // Check if the new state is already set
        if (this.currentStates.indexOf(newState) > -1) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg: The state ' + newState + ' already exists in this element.');
            return false;
        }

        // Add the new state to the list os current set states
        this.currentStates.push(newState); // Add a new State

        // Define the active shapes
        for (var i = 0; i < this.shapes.length; i++) {

            if (newState === 'Normal' && this.shapes[i].constructor.name === 'Rectangle') {
                this.shapes[i].activeState(this.name);
            }

            if (newState === 'Reverse' && this.shapes[i].constructor.name === 'Deviation') {
                this.shapes[i].activeState(this.name);
            }

            this.shapes[i].addState(newState);
        }

        // TO DO - Revise
        var listsubElements = mainConfig.statesSubElements[newState];     // Get all the subElements for this state. e.g : Block, Arrow
        if (listsubElements != undefined) {
            for (i = 0; i < listsubElements.length; i++) {
                for (var j = 0; j < this.subElements.length; j++) {
                    if (this.subElements[j].name === listsubElements[i]) {
                        this.subElements[j].addState(newState);
                    }
                }
            }
        }

    }

    /**
     * Default function to delete state to the elements
     * @param {string} deleteState the state to be removed from currentStates
     * @returns {boolean} confirmation
     */
    this.deleteState = function (deleteState) {

        // Check if a new state was passed as parameter
        if (!deleteState) {
            console.log('Element: ' + this.name + ' - Method:deleteState - Msg: The state wasn\'t set.');
            return false;
        }

        // Check if the deleteState is in the currente State list
        if (deleteState in this.currentStates) {
            console.log('Element: ' + this.name + ' - Method:deleteState - Msg: The state ' + deleteState + ' does not exists in this element.');
            return false;
        }

        // Remove the state
        this.currentStates.splice(this.currentStates.indexOf(deleteState), 1);

        // Remove the state from the shapes
        for (var i = 0; i < this.shapes.length; i++) {

            if (deleteState === 'Normal' && this.shapes[i].constructor.name === 'Rectangle') {
                this.shapes[i].desactiveState(this.name);
            }

            if (deleteState === 'Reverse' && this.shapes[i].constructor.name === 'Deviation') {
                this.shapes[i].desactiveState(this.name);
            }

            this.shapes[i].removeState(deleteState);
        }

        var listsubElements = mainConfig.statesSubElements[deleteState];

        if (listsubElements) {
            if (listsubElements.length > 0) {
                for (i = 0; i < listsubElements.length; i++) {
                    for (var j = 0; j < this.subElements.length; j++) {
                        if (this.subElements[j].name === listsubElements[i]) {
                            this.subElements[j].deleteState(deleteState);
                        }
                    }
                }
            }
        } else {
            alert(deleteState);
        }
        
    }

    this.destroy = function () {
        // Remove the state from the shapes
        this.elG.setAttribute("opacity", "0");
    }
}

/*
 *  Logical representation of the CDV in the field
 */
function Segment(name, track, x, width) {
    Element.call(this, name, track);

    this.x = x;
    this.width = width * this.proportion / 6;
    this.track = [track];

    if (name == '858_CDV_1D1T_RFSP') {
        var house = new House('house', x, this.y + 15, 'R');
        house.shapes[2].changeProperties({ fill: mainConfig.colors.red });

        house.build();
    }
        

    this.states = ['Block', 'Occup', 'UnblockConf', 'SpeedCodeEn', 'BckDir', 'FwdDir'];

    this.shapes = [new Rectangle()];

    // All the segments start with active state 0. It's necessary to update.
    this.shapes[0].changeProperties({ x: x, y: this.y, width: this.width });
    this.shapes[0].active = 1;
    this.shapes[0].updateStateProperties();   // All the segments start with active state. It's necessary to update.

    this.subElements = [new ArrowDirection(x, this.y, this.width), new Envelope(x, this.y, this.width, this.proportion * 3)];
}

/*
 *  Logical representation of the Switch in the field. Direction (up or down) and position (left or right)
 */
function Switch(name, track, x, position, direction) {
    Element.call(this, name, track);

    this.width = 6.83 * this.proportion;
    this.x = x;
    this.track = track;
    this.dir = (direction === 'left') ? "CAR" : "SLZ";

    // the switch occupy the track 1 and track 2
    if (track === 1 && position === "top" || track === 2 && position === "bottom")
        this.track = [1, 2];
    else
        this.track = [track];

    if (name.indexOf("CV03B") > -1) {

        var house = new House("TU", x + 20, 275, 'B');
        house.build();
    }
    if (name.indexOf("CV03C") > -1) {

        var house = new House("TU", x + 20, 275, 'C');
        house.build();
    }

    if (name.indexOf("SW01T") > -1) {
        var house = new House("TU", x + 20, 275, '');
        house.build();
    }

    if (name.indexOf("SW03T") > -1) {
        var house = new House("TU", x + 20, 275, '');
        house.build();
    }
        

    this.trackReverse = ((position === 'top') ? track + 1 : track - 1);

    this.states = ['Contfault', 'Fault', 'Frog1Fault', 'frog1handleoperated', 'Frog1Normal', 'Frog1Reverse', 'handleoperated', 'Normal',
    'Occup', 'Reverse', 'Block', 'LocalCtrl', 'LocalCtrlReq', 'ManualMode', 'ManualMode3rd',
    'ManualModeFrog', 'ManualModeReq', 'ManualModeReq3rd', 'ManualModeReqFrog', 'SpeedCodeEn', 'Switch1Locked',
    'UnblockConf'];

    this.shapes = [new Rectangle(), new Deviation()];
    this.shapes[0].changeProperties({ x: x, y: this.y, width: this.width, id: name + 'a' });


    // Deviation changes with direction and position
    this.shapes[1].changeProperties({
        x: x + (direction === 'left' ? 6.66 * this.proportion : 0),
        y: this.y - (position === 'up' ? 6.66 * this.proportion : 0),
        width: this.width,
        form: direction
    });

    if (direction == "left") {
        if (position == "bottom") {
            this.shapes[1].changeProperties({ x: x + 6.8 * proportion, y: this.y, width: this.width, form: "left" });
        }
        else {
            this.shapes[1].changeProperties({ x: x, y: this.y - 6.5 * proportion, width: this.width, form: "right" });
        }
    }
    else {
        if (position == "bottom") {
            this.shapes[1].changeProperties({ x: x, y: this.y, width: this.width, form: "right" });
        }
        else {
            this.shapes[1].changeProperties({ x: x + 6.8 * proportion, y: this.y - 6.5 * proportion, width: this.width, form: "left" });
        }
    }


    this.subElements = [new Fault(x, this.y, this.width / 10),
    new ManualMode(x, this.y + this.proportion * 2.0, this.width)];

    if (position == "bottom")
        this.subElements.push(new Envelope(x, this.y, this.width, this.proportion * 9.5));
    else
        this.subElements.push(new Envelope(x, this.y - 39, this.width, this.proportion * 9.5));


}

var Segment858 = function (name, track, x, flag) {
    Element.call(this, name, track);

    this.x = x;
    this.track = track;
    this.width = 85;

    this.states = ['Block', 'Occup', 'UnblockConf', 'SpeedCodeEn', 'BckDir', 'FwdDir'];

    if (flag == 0) {
        this.shapes = [new location858()];

        this.shapes[0].changeProperties({ x: x + 14.5 * proportion, y: this.y, form: 'left' });
    }
    else {
        this.shapes = [new LocationN()];
        this.shapes[0].changeProperties({ x: x, y: this.y, form: 'left' });
    }

    this.shapes[0].active = 1;

    this.shapes[0].updateStateProperties();   // All the segments start with active state. It's necessary to update.
}


/*
 * Creates a Train with name, position x, position y, width, diretion train, height 
 */
var Train = function (name, track, x, width) {
    Element.call(this, name, track);
    // Definde defaults
    if (!name) name = 'M000';
    if (!track) track = 1;
    if (!width) width = 100;
    if (!x) x = 0;

    this.x = x;

    this.segment = null;

    this.shapes = [new Rectangle(), new Triangle(), new Triangle(), new Rectangle(), new Text(), /*new Circle()*/];

    // Color changes
    this.shapes[1].properties.fill = mainConfig.colors.white;
    this.shapes[1].properties.stroke = mainConfig.colors.white;
    this.shapes[2].properties.fill = mainConfig.colors.yellow;
    this.shapes[2].properties.stroke = mainConfig.colors.yellow;
    this.shapes[3].properties.fill = mainConfig.colors.yellow;
    this.shapes[3].properties.stroke = mainConfig.colors.yellow;
    //this.shapes[5].properties.fill = mainConfig.colors.transparent;
    //this.shapes[5].properties.stroke = mainConfig.colors.white;

    // Train Color for each type of train
    this.type = name.charAt(0);

    if (this.type === "M") {
        this.shapes[0].properties.fill = mainConfig.colors.lightBlue;
    }

    if (this.type === "C") {
        this.shapes[0].properties.fill = mainConfig.colors.darkYellow;
        this.shapes[4].properties.fill = mainConfig.colors.darkYellow;
    }

    this.changePosition = function (x, direction, track) {


        if (direction != this.direction) {
            this.destroy();
            this.build();
        }

        if (!direction) direction = 1;
        if (!track) track = 1;
        this.track = track ? track : 1;
        this.x = x;
        this.y = mainConfig.track[track].y;
        this.direction = direction;

        if (direction === 1) {
            this.shapes[0].changeProperties({ x: this.x - width - 7, y: this.y - 1.33 * this.proportion, width: width });
            this.shapes[1].changeProperties({ x: this.x - 6, y: this.y - 1.33 * this.proportion, form: "rectangle", width: 1, height: 1 });
            this.shapes[2].changeProperties({ x: this.x + this.proportion * 5, y: this.y - 1.8 * this.proportion, form: "right", width: 0.6, height: 1 });
            this.shapes[3].changeProperties({ x: this.x, y: this.y - 2.33 * this.proportion, width: this.proportion * 5, height: 1 });
            this.shapes[4].changeProperties({ x: this.x + 15, y: this.y - this.proportion * 3.2, text: this.name, 'font-size': 11 });
            //this.shapes[5].changeProperties({ x: this.x + 110, y: this.y - 15, width: 28 });
        }

        if (direction === -1) {
            this.shapes[0].changeProperties({ x: this.x + 7, y: this.y - 1.33 * this.proportion, width: width });
            this.shapes[1].changeProperties({ x: this.x + 6, y: this.y - 1.33 * this.proportion, form: 'rectangle', width: -1, height: 1 });
            this.shapes[2].changeProperties({ x: this.x * 0.98, y: this.y - 1.8 * this.proportion, form: "right", width: -0.6, height: 1 });
            this.shapes[3].changeProperties({ x: this.x * 0.98, y: this.y - 2.33 * this.proportion, width: this.proportion * 5, height: 1 });
            this.shapes[4].changeProperties({ x: this.x, y: this.y - this.proportion * 3.2, text: this.name, 'font-size': 11 });
            //this.shapes[5].changeProperties({ x: this.x, y: this.y - 15, width: 28 });
        }

    }
}

// Creates a text with the KM
var KmText = function (x, y, text) {
    Element.call(this, "KmText", 1);

    // Default definitions
    if (!x) x = 50;
    if (!y) y = 20;
    if (!text) text = '0';

    if (parseInt(text) < 10)
        text = 'KM00' + text;
    else if (parseInt(text) >= 10 && parseInt(text) < 100)
        text = 'KM0' + text;
    else
        text = 'KM' + text;

    this.shapes = [new Rectangle(), new Text()];
    this.shapes[0].changeProperties({ x: x, y: y, width: 6.4 * this.proportion, height: 2.3 * this.proportion });
    this.shapes[1].changeProperties({ x: x + 19, y: y + 8, width: 8.33 * this.proportion, 'font-size': 10, text: text });

    // Color changes
    this.shapes[0].properties.fill = mainConfig.colors.white;
    this.shapes[0].properties.stroke = mainConfig.colors.black;

    this.shapes[1].properties.fill = mainConfig.colors.black;
}

var Alarm = function (x, y) {
    Element.call(this, "Alarm", 1);

    // Default definitions
    if (!x) x = 200;
    if (!y) y = 500;

    this.shapes = [new Triangle(), new Text()];

    this.shapes[0].changeProperties(x, y, "isosceles", 2.6, 2.6); // fix it
    this.shapes[1].changeProperties(x * 1.025, y * 0.986, this.proportion, this.proportion, 12, "!");
}

// Board with a man working
var CautionBoard = function (x, y, quantity) {
    Element.call(this, "CautionBoard", 1);

    // Default definitions
    if (!x) x = 100;
    if (!y) y = 100;
    if (!quantify) quantify = 100;

    this.localwidth = 10 * this.proportion;

    this.shapes = [new Rectangle(), new Image(), new Text()];

    this.shapes[0].changeProperties(x, y, this.localwidth, this.localwidth / 2);
    this.shapes[1].changeProperties(x, y + 2.5, this.localwidth / 2, this.localwidth / 2.5, '../images/cautionboard.png');
    this.shapes[2].changeProperties(x + this.localwidth / 2, y, this.localwidth / 2, this.localwidth / 2, 12, quantity);

    //Color changes
    this.shapes[0].properties.fill = mainConfig.colors.lightBlack;
    this.shapes[0].properties.stroke = mainConfig.colors.black;
    this.shapes[2].properties.fill = mainConfig.colors.white;
}

// Creates a text to put a new note  
var Note = function (x, y, text) {
    Element.call(this, "Note", 1);

    // Default definitions
    if (!x) x = 100;
    if (!y) y = 100;
    if (!text) text = 'M015';

    this.localwidth = text.length * 8;

    this.shapes = [new Rectangle(), new Text()];

    this.shapes[0].changeProperties(x, y, this.localwidth, 4 * this.proportion);
    this.shapes[1].changeProperties(x, y, this.localwidth, 4 * this.proportion, 10, text);

    //Color changes 
    this.shapes[0].properties.fill = mainConfig.colors.lightYellow;
    this.shapes[0].properties.stroke = mainConfig.colors.freeSpeechRed;
    this.shapes[1].properties.fill = mainConfig.colors.black;
    this.shapes[1].properties.stroke = mainConfig.colors.black;
}

/*
 * Create a universal crossover, the flag is used to alternates between 'TU' and 'TA'
 */
var UniversalCrossover = function (name, x, track, flag) {
    if (!name) name = "UniversalCrossover";
    if (!x) x = 80;
    if (!track) track = 0;
    if (!flag) flag = 0;

    this.flag = flag;
    track += 1;

    Element.call(this, name, track);

    this.width = 9 * this.proportion;

    this.x = x;
    this.states = ['Block1', 'Block2', 'LeftLocalCtrl1', 'LeftLocalCtrl2', 'LeftLocalCtrlReq1', 'LeftLocalCtrlReq2',
        'LeftSwitch1Locked', 'LeftSwitch1Manual', 'LeftSwitch1Manual3rd', 'LeftSwitch1ManualFrog',
        'LeftSwitch1ManualRequested', 'LeftSwitch1ManualRequested3rd', 'LeftSwitch1ManualRequestedFrog',
        'LeftSwitch2Locked', 'LeftSwitch2Manual', 'LeftSwitch2Manual3rd', 'LeftSwitch2ManualFrog',
        'LeftSwitch2ManualRequested', 'LeftSwitch2ManualRequested3rd', 'LeftSwitch2ManualRequestedFrog',
        'LeftSwitchContFault1', 'LeftSwitchContFault2', 'LeftSwitchFault1', 'LeftSwitchFault2', 'LeftSwitchFrog1Fault',
        'LeftSwitchFrog1Normal', 'LeftSwitchFrog1Reverse', 'LeftSwitchFrog2Fault', 'LeftSwitchFrog2Normal',
        'LeftSwitchFrog2Reverse', 'LeftSwitchNormal1', 'LeftSwitchNormal2', 'LeftSwitchReverse1', 'LeftSwitchReverse2',
        'Occup1', 'Occup2', 'RightLocalCtrl1', 'RightLocalCtrl2', 'RightLocalCtrlReq1', 'RightLocalCtrlReq2',
        'RightSwitch1Locked', 'RightSwitch1Manual', 'RightSwitch1Manual3rd', 'RightSwitch1ManualFrog',
        'RightSwitch1ManualRequested', 'RightSwitch1ManualRequested3rd', 'RightSwitch1ManualRequestedFrog',
        'RightSwitch2Locked', 'RightSwitch2Manual', 'RightSwitch2Manual3rd', 'RightSwitch2ManualFrog',
        'RightSwitch2ManualRequested', 'RightSwitch2ManualRequested3rd', 'RightSwitch2ManualRequestedFrog',
        'RightSwitchContFault1', 'RightSwitchContFault2', 'RightSwitchFault1', 'RightSwitchFault2',
        'RightSwitchFrog1Fault', 'RightSwitchFrog1Normal', 'RightSwitchFrog1Reverse', 'RightSwitchFrog2Fault',
        'RightSwitchFrog2Normal', 'RightSwitchFrog2Reverse', 'RightSwitchNormal1', 'RightSwitchNormal2',
        'RightSwitchReverse1', 'RightSwitchReverse2', 'SpeedCodeEn1', 'SpeedCodeEn2', 'UnblockConf1', 'UnblockConf2',
        'ContFault1', 'ContFault2', 'CrossoverLocalCtrl1', 'CrossoverLocalCtrl2', 'CrossoverLocalCtrlReq1',
        'CrossoverLocalCtrlReq2', 'Fault1', 'Fault2', 'ManualMode1', 'ManualMode2', 'ManualModeReq1', 'ManualModeReq2',
        'Switch1Locked', 'Switch2Locked', 'Active1', 'Active2', 'Inhibit1', 'Inhibit2'];

    this.shapes = {
        1: {
            left: {
                Rectangle: new Rectangle(),
                HalfDeviation: new HalfDeviation(),
            },
            right: {
                Rectangle: new Rectangle(),
                HalfDeviation: new HalfDeviation(),
            },
        },
        2: {
            left: {
                Rectangle: new Rectangle(),
                HalfDeviation: new HalfDeviation(),
            },
            right: {
                Rectangle: new Rectangle(),
                HalfDeviation: new HalfDeviation(),
            },
        },
    }

    this.track = [track];

    if (flag == 0) {
        this.shapes[2].left['Rectangle'].changeProperties({ x: x, y: this.y, width: 4.27 * this.proportion, height: this.proportion, id: name + "C" });
        this.shapes[2].left['HalfDeviation'].changeProperties({ x: x, y: this.y + this.proportion, form: 'topLeft' });
        this.shapes[2].right['Rectangle'].changeProperties({ x: x + 4.50 * this.proportion, y: this.y, width: 4.27 * this.proportion, height: this.proportion, id: name + "D" });
        this.shapes[2].right['HalfDeviation'].changeProperties({ x: x + 8.8 * this.proportion, y: this.y + this.proportion, form: 'topRight' });
        this.shapes[1].left['Rectangle'].changeProperties({ x: x, y: this.y + 6.5 * this.proportion, width: 4.27 * this.proportion, height: this.proportion, id: name + "A" });
        this.shapes[1].left['HalfDeviation'].changeProperties({ x: x + 4.41 * this.proportion, y: this.y + 7.5 * this.proportion, form: 'bottomRight' });
        this.shapes[1].right['Rectangle'].changeProperties({ x: x + 4.50 * this.proportion, y: this.y + 6.5 * this.proportion, width: 4.27 * this.proportion, height: this.proportion, id: name + "B" });
        this.shapes[1].right['HalfDeviation'].changeProperties({ x: x + 4.41 * this.proportion, y: this.y + 7.5 * this.proportion, form: 'bottomLeft' });

        this.subElements = {
            1: {
                right: [new Indication(x + 28 + 2.5, this.y + 55, "top", "left"), new ManualMode(x + 28 + 2.5, this.y + 60, this.width)/*,new DerailmentDetecter('DD', x + 28, track-1)*/],
                left: [new Indication(x - 2.5, this.y + 55, "top", "right"), new ManualMode(x - 2.5, this.y + 60, this.width)],
                Block: [new Envelope(x, this.y, this.width, this.proportion * 9.5)],
                House: [new House(mainConfig.house.name[this.name], x + 20, 275, '')]
            },
            2: {
                
                right: [new Indication(x + 28 + 2.5, this.y - 20, "bottom", "left"), new ManualMode(x + 28 + 2.5, this.y - 29, this.width)/*, new DerailmentDetecter('DD', x + 28, track)*/],
                left: [new Indication(x - 2.5, this.y - 20, "bottom", "right"), new ManualMode(x - 2.5, this.y - 29, this.width)],
                Block: [new Envelope(x, this.y, this.width, this.proportion * 9.5)]
            }
        }

    }
    else {
        this.shapes[2].left['Rectangle'].changeProperties({ x: x, y: this.y, width: 4.30 * this.proportion, height: this.proportion, id: name + "C" });
        this.shapes[2].right['Rectangle'].changeProperties({ x: x + 4.50 * this.proportion, y: this.y, width: 4.28 * this.proportion, height: this.proportion, id: name + "D" });
        this.shapes[1].left['Rectangle'].changeProperties({ x: x, y: this.y + 6.5 * this.proportion, width: 4.28 * this.proportion, height: this.proportion, id: name + "A" });
        this.shapes[1].right['Rectangle'].changeProperties({ x: x + 4.50 * this.proportion, y: this.y + 6.5 * this.proportion, width: 4.28 * this.proportion, height: this.proportion, id: name + "B" });
        this.shapes[2].left['HalfDeviation'].changeProperties({ x: x + this.proportion * 4.4, y: this.y + this.proportion, form: 'topRight' });
        this.shapes[2].right['HalfDeviation'].changeProperties({ x: x + this.proportion * 4.4, y: this.y + this.proportion, form: 'topLeft' });
        this.shapes[1].left['HalfDeviation'].changeProperties({ x: x, y: this.y + 7.33 * this.proportion, form: 'bottomLeft' });
        this.shapes[1].right['HalfDeviation'].changeProperties({ x: x + 8.8 * this.proportion, y: this.y + 7.5 * this.proportion, form: 'bottomRight' });

        this.subElements = {
            1: {
                left: [new Indication(x - 2.5, this.y + 55, "top", "left"), new ManualMode(x - 2.5, this.y + 60, this.width)],
                right: [new Indication(x + 28 + 2.5, this.y + 55, "top", "right"), new ManualMode(x + 28 + 2.5, this.y + 60, this.width) /*,new DerailmentDetecter('DD', x + 28, track-1)*/],
                Block: [new Envelope(x, this.y + 35, this.width, this.proportion * 3.8)],
                House: [new House(mainConfig.house.name[this.name], x + 20, 275, '')]
            },
            2: {
                left: [new Indication(x - 2.5, this.y - 20, "bottom", "left"), new ManualMode(x, this.y - 29, this.width)],
                right: [new Indication(x + 28 + 2.5, this.y - 20, "bottom", "right"), new ManualMode(x + 28 + 2.5, this.y - 29, this.width) /*,new DerailmentDetecter('DD', x + 28, track)*/],
                Block: [new Envelope(x, this.y, this.width, this.proportion * 3.8)]
            }
        }

    }


    this.addState = function (newState) {

        var track = 1;          // Track 1 or Track 2
        var position = '';     // Position Left or Right

        if (!newState) {
            console.log('Element:UniversalCrossover -  Method:setState: ' + newState + ' is empty.');
            return false;
        }

        // Check if the new state is in the possible states list
        if (this.states.indexOf(newState) === -1) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg: The state ' + newState + 'is not valid for this element.');
            return false;
        }

        if (newState in this.currentStates) {
            console.log('Element setState: ' + newState + ' already exists in the currentStates.');
            return false;
        }

        if (newState.indexOf('1') >= 0 || newState.indexOf('2') >= 0) {   // Find Track 1 or Track 2 and save it
            track = newState.replace(/[^1-2]/g, '');
        }

        if (newState.indexOf('Left') >= 0) {   // If it's a state to left side
            position = "left";
        }

        if (newState.indexOf('Right') >= 0) { // If it's a state to right side
            position = "right";
        }

        if (newState.indexOf("Frog") == -1) {
            if (position != '') {     // If it has a side to apply the state    
                for (var key in this.shapes[track].left) {
                    if (newState.indexOf('Normal') >= 0 && key == 'Rectangle') {                    // All states with 'Normal' state are used to the shape 'Rectangle' 
                        this.shapes[track][position][key].activeState(this.name);
                    }

                    if (newState.indexOf('Reverse') >= 0 && key == 'HalfDeviation') {            // All states with 'Reverse' state are used to the shape 'HalfDeviation' 
                        this.shapes[track][position][key].activeState(this.name);
                    }
                }
            }
            else {                  // If it's a state to apply to both side - Right and Left. For example, Block2.
                for (var key in this.shapes[track].right) {

                    newState = newState.replace(/[1-2]/g, '');
                    this.shapes[track].right[key].addState(newState);
                    this.shapes[track].left[key].addState(newState);
                }
            }
        }
        // TO DO - Revise
        var listsubElements = mainConfig.statesSubElements[newState];     // Get all the subElements for this state. e.g : Block, Arrow
        
        if (listsubElements != undefined) {

            // Derailment Decteter
        /*    if (newState == "Active" || newState == "Inhibit") {
                this.subElements[track].right[2].addState(newState);
                return;
            } */

            if (newState == "Block") {
                this.subElements[track].Block[0].addState(newState);
            }
            else {
                for (var j = 0; j < 2; j++) {
                    if (this.subElements[track].left[j].name === listsubElements[0]) {


                        if (position == "left")
                            this.subElements[track].left[j].addState(newState);

                        if (position == "right")
                            this.subElements[track].right[j].addState(newState);

                    }
                }
            }
            
            
            
        } 

        return true;
    }

    this.deleteState = function (state) {
        // Check if a new state was passed as parameter

        var track;
        var position;

        if (!state) {
            console.log('Element: ' + this.name + ' - Method:deleteState - Msg: The state wasn\'t set.');
            return false;
        }

        // Check if the deleteState is in the currente State list
        if (state in this.currentStates) {
            console.log('Element: ' + this.name + ' - Method:deleteState - Msg: The state ' + state + ' does not exists in this element.');
            return false;
        }

        if (state.indexOf('1') >= 0 || state.indexOf('2') >= 0) {   // Find Track 1 or Track 2 and save it
            track = state.replace(/[^1-2]/g, '');
        }

        if (state.indexOf('Left') >= 0) {   // If it's a state to left side
            position = "left";
        }
        else if (state.indexOf('Right') >= 0) { // If it's a state to right side
            position = "right";
        }

        if (position) {     // If it has a side to apply the state    
            for (var key in this.shapes[track].left) {
                if (state.indexOf('Normal') >= 0 && key == 'Rectangle') {                    // All states with 'Normal' state are used to the shape 'Rectangle' 
                    this.shapes[track][position][key].desactiveState(this.name);
                }

                if (state.indexOf('Reverse') >= 0 && key == 'HalfDeviation') {            // All states with 'Reverse' state are used to the shape 'HalfDeviation' 
                    this.shapes[track][position][key].desactiveState(this.name);
                }
            }
        }
        else {                  // If it's a state to apply to both side - Right and Left. For example, Block2.
            for (var key in this.shapes[track].right) {

                state = state.replace(/[1-2]/g, '');
                this.shapes[track].right[key].removeState(state);
                this.shapes[track].left[key].removeState(state);
            }
        }

        // Remove the state
        /*this.currentStates.splice(this.currentStates.indexOf(state), 1);

        // Remove the state from the shapes
        for (var i = 1; i <= 2; i++) {

            state = state.replace(/[1-2]/g, '');
            for (var key in this.shapes[i].right) {
                this.shapes[i].right[key].removeState(state);
            }

            for (var key in this.shapes[i].left) {
                this.shapes[i].left[key].removeState(state);
            }
        }*/

    }

    // Default build method to create the shapes and add to the svg container
    this.build = function () {
        var elG = null;
        var key;

        elG = document.createElementNS(this.namespace, 'g');
        elG.setAttribute('id', this.name);
        elG.setAttribute('class', "KM " + this.name.split("_")[0]);

        $(elG).qtip({ content: { text: this.name.split("_")[1] } });

        for (var i = 1; i <= 2; i++) {
            for (key in this.shapes[i].left) {    // All the shapes into shapes left
                this.shapes[i].left[key].createShape();
                elG.appendChild(this.shapes[i].left[key].svgElement);
            }
            key = 0;
            for (key in this.shapes[i].right) { // All the shapes into shapes right 
                this.shapes[i].right[key].createShape();
                elG.appendChild(this.shapes[i].right[key].svgElement);
            }

            for (var j = 0; j < this.subElements[i].left.length; j++) {
                this.subElements[i].left[j].createElement();
                this.subElements[i].right[j].createElement();
            }

            // Derailment Dectetor
        //    this.subElements[i].right[2].createElement();

        //    this.subElements[i].Block[0].createElement();

        }
        this.subElements[1].House[0].build();

        this.svgContainer.appendChild(elG);

    }
}

/**
* TO DO: Change to subElement
*/
// Detecter to put in a CDV
var DerailmentDetecter = function (name, x, track) {
    Element.call(this, name, track);

    var y = mainConfig.track[track].y;
    // Default definitions
    if (!x) x = 10;
    if (!name) name = 'DD';

    this.states = ['None', 'Active', 'Inhibit'];

    this.currentStates = [0, 0, 0];

    this.shapes = [new Arrow(), new Arrow()];
    this.shapes[0].changeProperties({ x: x, y: y - proportion, width: proportion * 1.2, form: 'down' });
    this.shapes[1].changeProperties({ x: x, y: y + proportion * 2, width: proportion * 1.2, form: 'up' });

    // Color Changes
    this.shapes[0].properties.fill = mainConfig.colors.darkBlue;
    this.shapes[0].properties.stroke = mainConfig.colors.darkBlue;
    this.shapes[1].properties.fill = mainConfig.colors.darkBlue;
    this.shapes[1].properties.stroke = mainConfig.colors.darkBlue;

    this.properties = {
        'Active': { 0: { fill: mainConfig.colors.red, stroke: mainConfig.colors.red }, 1: { fill: mainConfig.colors.red, stroke: mainConfig.colors.red } },
        'Inhibit': { 0: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 1: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue } }
    }

    this.addState = function (newState) {

        if (!this.elG) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg:  The SVG Element was not found.');
            return false;
        }

        if (this.states.indexOf(newState) === -1) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg: The state ' + newState + ' was not found for this shape.');
            return false;
        }

        var indexState = this.states.indexOf(newState);

        if (this.currentStates[indexState] === 1) {
            console.log('Element: ' + this.name + ' - Method:addState - Msg: The state ' + newState + ' already exists in this shape.');
            return false;
        }

        this.currentStates[indexState] = 1;

        this.updateStateProperties();
    }

    this.updateStateProperties = function () {

        for (var i = 0; i < this.currentStates.length; i++) {
            if (this.currentStates[i] == 1) {
                var shapes = this.properties[this.states[i]];
                for (var shape in shapes) {
                    var properties = this.properties[this.states[i]][shape];
                    this.shapes[shape].changeProperties(properties);
                }
            }
        }

        if(this.currentStates.indexOf(1) > -1)
            this.elG.setAttribute('visibility', 'visible');
        else 
            this.elG.setAttribute('visibility', 'hidden');
    }

    /**
     * Default function to delete state to the elements
     * @param {string} deleteState the state to be removed from currentStates
     * @returns {boolean} confirmation
     */
    this.deleteState = function (deleteState) {

        // Check if a new state was passed as parameter
        if (!deleteState) {
            console.log('Element: ' + this.name + ' - Method:deleteState - Msg: The state wasn\'t set.');
            return false;
        }

        // Check if the deleteState is in the currente State list
        if (deleteState in this.currentStates) {
            console.log('Element: ' + this.name + ' - Method:deleteState - Msg: The state ' + deleteState + ' does not exists in this element.');
            return false;
        }

        var indexState = this.states.indexOf(deleteState);

        this.currentStates[indexState] = 0;

        if (this.currentStates.indexOf(1) == -1)
            this.elG.setAttribute('visibility', 'hidden');
    }

    // Default build method to create the shapes and add to the svg container
    this.build = function () {
        var key;

        // Create the g svg element to group all shapes that will be used in this element
        this.elG = document.createElementNS(this.namespace, 'g');
        this.elG.setAttribute('id', this.name);
        this.elG.setAttribute('class', "KM Location" + this.name.split("_")[0]);

        // Add all the shapes to the g svg element
        for (var i = 0; i < this.shapes.length; i++) {      // Iterates between all the shapes
            this.shapes[i].createShape();                 // Creates shape
            this.elG.appendChild(this.shapes[i].svgElement);
        }

        // Append the subElements to the g svg element
        for (i = 0; i < this.subElements.length; i++) {
            this.subElements[i].createElement();
            this.elG.appendChild(this.subElements[i].elG);
        }
        // and add the g svg element to the svg container
        this.svgContainer.appendChild(this.elG);

        $(this.elG).qtip({
            content: {
                text: this.name
            }
        });

        this.elG.setAttribute('visibility', 'hidden');
    }
}

/*
 *  Creates a House with name,x,y,text
 */
var House = function (name, x, y, text) {
    Element.call(this, name, 2);
    // Definde defaults
    if (!x) x = 0;
    if (!y) y = 0;
    if (!text) text = '';

    this.possibleStates = ['ACFault', 'AccessRequested', 'CodeMLeft', 'CodeMRight', 'DCFault', 'FanFault', 'LeftShelterCommunicationFault', 'LocalCtrl', 'LocalCtrlAuth', 'LocalCtrlReq',
        'MainentanceMode', 'MainentanceModeAuth', 'MainentanceModeReq', 'OpenDoor', 'RightShelterCommunicationFault'];

    this.currentStates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.localwidth = 3 * this.proportion;

    this.shapes = [new Triangle(), new Rectangle(), new Text()];

    this.shapes[0].changeProperties({ x: x, y: y, form: "isosceles", width: this.localwidth * 0.17, height: this.localwidth * 0.04 });
    this.shapes[1].changeProperties({ x: x, y: y + 2, width: this.localwidth, height: this.localwidth });
    this.shapes[2].changeProperties({ x: x + this.localwidth * 0.5, y: y + this.localwidth * 0.6, width: this.localwidth * 0.4, height: 12, 'font-size': 11, text: text });

    // Color changes
    this.shapes[0].properties.fill = mainConfig.colors.black;

    this.properties = {
        None: {},
        ACFault: {},
        AccessRequested: {},
        CodeMLeft: {},
        CodeMRight: {},
        DCFault: { 2: { text: 'R', fill: mainConfig.colors.red, stroke: mainConfig.colors.red } },
        FanFault: {},
        LeftShelterCommunicationFault: {},
        LocalCtrl: {},
        LocalCtrlAuth: {},
        LocalCtrlReq: {},
        MainentanceMode: {},
        MainentanceModeAuth: {},
        MainentanceModeReq: {},
        OpenDoor: {},
        RightShelterCommunicationFault: {}
    }

    this.build = function () {
        var key;

        // Create the g svg element to group all shapes that will be used in this element
        this.elG = document.createElementNS(this.namespace, 'g');
        this.elG.setAttribute('id', this.name);
        this.elG.setAttribute('class', "KM Location" + this.name.split("_")[0]);

        // Add all the shapes to the g svg element
        for (var i = 0; i < this.shapes.length; i++) {      // Iterates between all the shapes
            this.shapes[i].createShape();                 // Creates shape
            this.elG.appendChild(this.shapes[i].svgElement);
        }

        // Append the subElements to the g svg element
        for (i = 0; i < this.subElements.length; i++) {
            this.subElements[i].createElement();
            this.elG.appendChild(this.subElements[i].elG);
        }
        // and add the g svg element to the svg container
        this.svgContainer.appendChild(this.elG);

        var text = this.name;

        $(this.elG).qtip({
            content: {
                text: "Abrigo:" + text
            }
        });

    }
}

// Represents a symbol to indicate that a region is with Speed Restriction
var SpeedRestriction = function (name, x, track, width, text) { // I need to fix default points to work well
    Element.call(this, "SpeedRestriction " + name, track);

    if (!x) this.x = 600;
    if (!width) this.width = 100;
    if (!text) this.text = '50';

    this.shapes = [new Restriction(), new Circle(), new Circle(), new Text(), new Text()];

    this.shapes[0].changeProperties(x, this.y + this.proportion * 2, width / this.proportion);
    this.shapes[1].changeProperties(x + 12, this.y + this.proportion * 1.16 + 4 + this.proportion * 2, 2.5 * this.proportion);
    this.shapes[2].changeProperties(x + width, this.y + this.proportion * 1.16 + 4 + this.proportion * 2, 2.5 * this.proportion);
    this.shapes[3].changeProperties(x + 5, this.y + 20, 2.5 * this.proportion, 6, 10, text);
    this.shapes[4].changeProperties(x + width - 8, this.y + 20, 2.5 * this.proportion, 6, 10, text);

    // Color changes
    this.shapes[1].properties.fill = mainConfig.colors.lightYellow;
    this.shapes[1].properties.stroke = mainConfig.colors.freeSpeechRed;
    this.shapes[2].properties.fill = mainConfig.colors.lightYellow;
    this.shapes[2].properties.stroke = mainConfig.colors.freeSpeechRed;
    this.shapes[3].properties.fill = mainConfig.colors.freeSpeechRed;
    this.shapes[4].properties.fill = mainConfig.colors.freeSpeechRed;

}


/*=====  End of Section comment block  ======*/
