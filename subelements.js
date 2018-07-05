var proportion = mainConfig.size.proportion;

function SubElement(name) {
    // Element name
    this.name = name;

    // Namespace and svg container
    this.svgContainer = document.getElementById('svgPrincipal');
    this.namespace = "http://www.w3.org/2000/svg";

    this.elG = null;

    // the shapes that compose the subElement
    this.shapes = [];

    this.possibleStates = [];

    this.currentStates = [];

    this.properties = [];

    this.proportion = mainConfig.size.proportion;

    // Default build method to create the shapes and add to the svg container
    this.createElement = function () {
        this.elG = document.createElementNS(this.namespace, 'g');
        this.elG.setAttribute('id', this.name);
        this.elG.setAttribute('visibility', 'hidden');

        for (var i = 0; i < this.shapes.length; i++) {      // Iterates between all the shapes
            this.shapes[i].createShape();                       // Creates shape
            this.elG.appendChild(this.shapes[i].svgElement);
        }
        this.svgContainer.appendChild(this.elG);
    }

    this.setVisible = function () {
        this.elG.setAttribute('visibility', 'visible');
    }

    this.setInvisible = function () {
        this.elG.setAttribute('visibility', 'hidden');
    }

    this.addState = function (newState) {

        if (!this.elG) {
            console.log('SubElement: ' + this.name + ' - Method:addState - Msg:  The SVG Element was not found.');
            return false;
        }

        if (this.possibleStates.indexOf(newState) === -1) {
            console.log('SubElement: ' + this.name + ' - Method:addState - Msg: The state ' + newState + ' was not found for this shape.');
            return false;
        }

        var indexState = this.possibleStates.indexOf(newState);
        
        if (this.currentStates[indexState] === 1) {
            console.log('SubElement: ' + this.name + ' - Method:addState - Msg: The state ' + newState + ' already exists in this shape.');
            return false;
        }

        this.currentStates[indexState] = 1;

        this.updateStateProperties();
        this.setVisible();
    }

    this.deleteState = function (deleteState) {

        if (this.possibleStates.indexOf(deleteState) === -1) {
            console.log('SubElement: ' + this.name + ' - Method:deleteState - Msg: The state ' + deleteState + ' was not found for this subelement.');
            return false;
        }

        var indexState = this.possibleStates.indexOf(deleteState);

        this.currentStates[indexState] = 0;

        if (this.currentStates.indexOf(1) === -1) {   // If there is no state.It's necessary to hidden this subelement
            this.setInvisible();
        }

        this.updateStateProperties();
    }

    this.updateStateProperties = function () {

        for (var i = 0; i < this.currentStates.length; i++) {
            if (this.currentStates[i] == 1) {
                var shapes = this.properties[this.possibleStates[i]];
                for (var shape in shapes) {
                    var properties = this.properties[this.possibleStates[i]][shape];
                    this.shapes[shape].changeProperties(properties);
                }
            }
        }
    }
}

// Creates indication to Universal CrossOver
var Indication = function (x, y, vPos, hPos) {
    SubElement.call(this, "Indication");

    this.possibleStates = ['Frog1Reverse', 'Frog1Normal', 'Frog1Fault',
        'LeftSwitchFrog1Reverse', 'RightSwitchFrog1Reverse','LeftSwitchFrog1Normal', 'RightSwitchFrog1Normal',
        'LeftSwitchFrog2Reverse', 'RightSwitchFrog2Reverse','LeftSwitchFrog2Normal', 'RightSwitchFrog2Normal'];

    this.currentStates = [0, 0, 0, 0, 0];

    this.localwidth = proportion * 8.33;
    
    this.shapes = [new Rectangle(), new SmallHalfDeviation(), new Circle(), new Text()];

    if (vPos == "top" && hPos == "left") {
        this.shapes[0].changeProperties({ x: x, y: y + 5.8, height: proportion / 2.5, width: 4.16 * proportion, visibility: 'visible' });   // Rectangle
        this.shapes[1].changeProperties({ x: x + 4.16 * proportion, y: y, form: hPos, visibility: 'visible' }); // SmallHalfDeviation
    }
    else if (vPos == "top" && hPos == "right") {
        this.shapes[0].changeProperties({ x: x, y: y + 5.8, height: proportion / 2.5, width: 4.16 * proportion, visibility: 'visible' });   // Rectangle
        this.shapes[1].changeProperties({ x: x, y: y, form: hPos, visibility: 'visible' }); // SmallHalfDeviation
    }
    else if (vPos == "bottom" && hPos == "left") {
        this.shapes[0].changeProperties({ x: x, y: y, height: proportion / 2.5, width: 4.18 * proportion, visibility: 'visible' });   // Rectangle
        this.shapes[1].changeProperties({ x: x + 4.16 * proportion, y: y, form: hPos, visibility: 'visible' }); // SmallHalfDeviation
    }
    else {
        this.shapes[0].changeProperties({ x: x, y: y, height: proportion / 2.5, width: 4.18 * proportion, visibility: 'visible' });   // Rectangle
        this.shapes[1].changeProperties({ x: x, y: y, form: hPos, visibility: 'visible' }); // SmallHalfDeviation
    }

    this.shapes[2].changeProperties({ cx: x - 20, cy: y - 20, r: this.localwidth / 8, fill: mainConfig.colors.red, stroke: mainConfig.colors.red, visibility: ' ' }); // circle
    this.shapes[3].changeProperties({ x: x + 12, y: y + 8, 'font-size': 18, visibility: 'visible', text: '?', fill: mainConfig.colors.yellow, stroke: mainConfig.colors.yellow }); // Text

    this.properties = {
        None: { 1: { visibility: 'visible' }, 2: { visibility: 'visible' }, 3: { visibility: 'visible', text: '?', fill: mainConfig.colors.yellow, stroke: mainConfig.colors.yellow } },
        Frog1Reverse: { 1: {visibility:'visible'}, 2: {visibility:''}, 3: {visibility:''} },
        Frog1Normal: { 1: { visibility: 'hidden' }, 2: { visibility: 'hidden' }, 3: { visibility: 'hidden' } },
        Frog1Fault: { 1: { visibility: 'visible' }, 2: { fill: mainConfig.colors.red, stroke: mainConfig.colors.red, visibility: 'visible' }, 3: { visibility: 'visible', text: 'x', fill: mainConfig.colors.white, stroke: mainConfig.colors.white } },

        LeftSwitchFrog1Reverse: { 0: { visibility: 'hidden' }, 1: { visibility: 'visible', x: x + 4.16 * proportion }, 2: { visibility: 'hidden' }, 3: { text: '' } },
        RightSwitchFrog1Reverse: { 0: { visibility: 'hidden' }, 1: { visibility: 'visible', x: x }, 2: { visibility: 'hidden' }, 3: { text: '' } },
        LeftSwitchFrog1Normal: { 0: { visibility: 'visible' }, 1: { visibility: 'hidden', x: x + 4.16 * proportion }, 2: { visibility: 'hidden' }, 3: { text: '' } },
        RightSwitchFrog1Normal: { 0: { visibility: 'visible' }, 1: { visibility: 'hidden', x: x }, 2: { visibility: 'hidden' }, 3: { text: '' } },

        LeftSwitchFrog2Reverse: { 0: { visibility: 'hidden' }, 1: { visibility: 'visible', x: x + 4.16 * proportion }, 2: { visibility: 'hidden' }, 3: { text: '' } },
        RightSwitchFrog2Reverse: { 0: { visibility: 'hidden' }, 1: { visibility: 'visible', x: x }, 2: { visibility: 'hidden' }, 3: { text: '' } },
        LeftSwitchFrog2Normal: { 0: { visibility: 'visible' }, 1: { visibility: 'hidden', x: x + 4.16 * proportion }, 2: { visibility: 'hidden' }, 3: { text: '' } },
        RightSwitchFrog2Normal: { 0: { visibility: 'visible' }, 1: { visibility: 'hidden', x: x }, 2: { visibility: 'hidden' }, 3: { text: '' } },
    }

    this.updateStateProperties = function () {

        if (this.currentStates.indexOf(1) == -1) {  // There is no state added
            var shapes = this.properties['None'];
            for (var shape in shapes) {
                var properties = this.properties['None'][shape];
                this.shapes[shape].changeProperties(properties) ;
            }
            return;
        }

        for (var i = 0; i < this.currentStates.length; i++) {
            if (this.currentStates[i] == 1) {
                var curShapes = this.properties[this.possibleStates[i]];
                for (var sh in curShapes) {
                    var prop = this.properties[this.possibleStates[i]][sh];
                    if (sh == 1)
                        prop.x = this.shapes[sh].config.x;
                    this.shapes[sh].changeProperties(prop);
                }
            }
        }
    }
}

// The ArrowDirection is used to show a route direction
var ArrowDirection = function (x, y, width, direction) {
    SubElement.call(this, "Arrow");

    this.possibleStates = ['FwdDir', 'BckDir'];

    this.currentStates = [0, 0];

    this.shapes = [new Triangle()];

    this.properties = {
        FwdDir: { 0: { x: x + width / 2, y: y + 5, form: "right", width: 0.7, height: 0.9, fill: mainConfig.colors.black, stroke: mainConfig.colors.white } },
        BckDir: { 0: { x: x + width / 2, y: y + 5, form: "right", width: -0.7, height: 0.9, fill: mainConfig.colors.black, stroke: mainConfig.colors.white } },
    }
}

// Creates a block in CDV
var Envelope = function (x, y, width, height) {
    SubElement.call(this, "Envelope");

    this.possibleStates = ['Block', 'Block1', 'Block2'];

    this.currentStates = [0, 0, 0];

    this.shapes = [new Rectangle()];

    this.shapes[0].changeProperties({
        x: x - (mainConfig.size.separator / 2), y: y - proportion, width: width + mainConfig.size.separator
        , height: height
    });

    this.properties = {
        Block: { 0: { fill: mainConfig.colors.transparent, stroke: mainConfig.colors.purple } },
        Block1: { 0: { fill: mainConfig.colors.transparent, stroke: mainConfig.colors.purple } },
        Block2: { 0: { fill: mainConfig.colors.transparent, stroke: mainConfig.colors.purple } }
    }
}

var Fault = function (x, y, width) {
    SubElement.call(this, "Fault");

    this.possibleStates = ['Fault', 'Confault'];

    this.currentStates = [0, 0];

    this.shapes = [new Circle(), new Text()];

    this.shapes[0].changeProperties({ cx: x, cy: y + 40, r: width * 1.6, fill: mainConfig.colors.yellow, stroke: mainConfig.colors.yellow });
    this.shapes[1].changeProperties({ x: x, y: y + 40, text: 'x', fill: mainConfig.colors.black, stroke: mainConfig.colors.black, 'font-size': 18 });

    this.properties = {
        Fault: { 0: { fill: mainConfig.colors.red, stroke: mainConfig.colors.red }, 1: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white } },
        Confault: { 0: { fill: mainConfig.colors.yellow, stroke: mainConfig.colors.yellow }, 1: { fill: mainConfig.colors.black, stroke: mainConfig.colors.black } },
    }
}

var ManualMode = function (x, y, width) {
    SubElement.call(this, "ManualMode");

    this.possibleStates = ["Switch1Locked", "LocalCtrl", "LocalCtrlReq", "ManualMode", "ManualMode3rd", 'ManualModeFrog', 'ManualModeReq', 'ManualModeReq3rd', 'ManualModeReqFrog',
        'RightSwitch2Locked', 'RightSwitch1Locked', 'LeftSwitch2Locked', 'LeftSwitch1Locked'
    ];

    this.currentStates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.shapes = [new Rectangle(), new Circle(), new Text()];

    this.shapes[0].changeProperties({ x: x, y: y, width: width / 3, height: 4.5 });
    this.shapes[1].changeProperties({ x: x + 18, y: y + 2, cx: x + width / 2.3, cy: y * 1.015, r: width / 22, width: 1.8 });
    this.shapes[2].changeProperties({ x: x, y: y + 13, text: 'AP', 'font-size': 8, fill: mainConfig.colors.white });

    // Properties 
    this.properties = {
        Switch1Locked: { 0: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white }, 1: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white }, 2: { text: 'T', fill: mainConfig.colors.white } },
        LocalCrtl: { 0: { fill: mainConfig.colors.red, stroke: mainConfig.colors.red }, 1: { fill: mainConfig.colors.red, stroke: mainConfig.colors.red }, 2: { text: '' } },
        LocalCrtlReq: { 0: { fill: mainConfig.colors.yellow, stroke: mainConfig.colors.yellow }, 1: { fill: mainConfig.colors.yellow, stroke: mainConfig.colors.yellow }, 2: { text: '' } },
        ManualMode: { 0: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 1: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 2: { text: 'PA', fill: mainConfig.colors.darkBlue } },
        ManualMode3rd: { 0: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 1: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 2: { text: '3a', fill: mainConfig.colors.darkBlue } },
        ManualModeFrog: { 0: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 1: { fill: mainConfig.colors.darkBlue, stroke: mainConfig.colors.darkBlue }, 2: { text: 'JPM', fill: mainConfig.colors.darkBlue } },
        ManualModeReq: { 0: { fill: mainConfig.colors.orange, stroke: mainConfig.colors.orange }, 1: { fill: mainConfig.colors.orange, stroke: mainConfig.colors.orange }, 2: { text: 'PA', fill: mainConfig.colors.orange } },
        ManualModeReq3rd: { 0: { fill: mainConfig.colors.orange, stroke: mainConfig.colors.orange }, 1: { fill: mainConfig.colors.orange, stroke: mainConfig.colors.orange }, 2: { text: '3a', fill: mainConfig.colors.orange } },
        ManualModeReqFrog: { 0: { fill: mainConfig.colors.orange, stroke: mainConfig.colors.orange }, 1: { fill: mainConfig.colors.orange, stroke: mainConfig.colors.orange }, 2: { text: 'JPM', fill: mainConfig.colors.orange } },
        RightSwitch2Locked: { 0: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white, width: width/3.5 }, 1: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white }, 2: { text: 'T', fill: mainConfig.colors.white, x: x + 25, y: y + 2 } },
        RightSwitch1Locked: { 0: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white, y: y + 6, width: width/3.5 }, 1: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white, y: y + 8 }, 2: { text: 'T', fill: mainConfig.colors.white,  x: x + 25, y: y + 9  } },
        LeftSwitch2Locked: { 0: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white, width: width / 3.5 }, 1: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white }, 2: { text: 'T', fill: mainConfig.colors.white, y: y + 2, x: x - 4 } },
        LeftSwitch1Locked: { 0: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white, y: y + 6, width: width / 3.5 }, 1: { fill: mainConfig.colors.white, stroke: mainConfig.colors.white, y: y + 8 }, 2: { text: 'T', fill: mainConfig.colors.white, y: y + 9, x: x - 4} }
    }

    this.updateStateProperties = function () {
        var text = '';

        for (var i = 0; i < this.currentStates.length; i++) {
            if (this.currentStates[i] === 1) {
                var shapes = this.properties[this.possibleStates[i]];
                for (var shape in shapes) {
                    var properties = this.properties[this.possibleStates[i]][shape];
                    this.shapes[shape].changeProperties(properties);
                    if (shape === 2) {
                        text += properties.text + " ";
                    }
                }

                if (shape === 2) {
                    var size = text.length * (2.5);
                    this.shapes[shape].changeProperties({ x: x - size, text: text });
                }
            }
        }
    }
}
