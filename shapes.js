/*=============================================
=            Playback Shapes            =
=============================================*/
/**
 * We intend to build the rail in the html. To do that we choose the SVG tecnology to build 
 * the shapes that we'll use in this project. This is the base of the rail elements.
 *
 */

/**
 * Shape Class ---
 * 
 * Shape class responsable for the drawing and manipulation of svg elements
 * Default configuration of the svg elements 
 */
function Shape() {

    // Default shape definitions
    this.id = this.constructor.name;
    this.namespace = "http://www.w3.org/2000/svg";
    this.svgContainer = document.getElementById('svgPrincipal');
    this.svgContainerHeight = parseInt(getComputedStyle(this.svgContainer).height.replace('px', ''));
    this.svgElement = null;
    this.shape = "polygon";
    this.name = "";
    // Defines the shape status: active and inactive
    // The shape fill color is influenciated by this parameter
    this.active = 0;

    // properties that are not set in the svg element
    this.config = { form: 'default' };

    // Shape default properties
    this.properties = {
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
    }

    /**
     * All the states that a shape can be, listed in priority order, 
     * from the great to lower priority
     * The currentStates variable flags is just to set which state is current on
     */
    this.possibleStates = ['SpeedCodeEn', 'UnblockConf', 'Block', 'Occup'];

    // Represents if the states are added or not to the current states. 0 false, 1 true
    this.currentStates = [0, 0, 0, 0];

    this.route = { flag: 0, status: 'Grant'};

    /**
     * Add a state to the shape
     * @param {string} newState add the new state to the shape
     * @returns {boolean} confirmation
     */
    this.addState = function (newState) {
        // Check if the svgElement was already created to add the new state
        if (!this.svgElement) {
          //  console.log('Shape: ' + this.id + ' - Method:addState - Msg:  The SVG Element was not found.');
            return false;
        }

        // Check if the possible states of this element contain the new state to be added
        var indexState = this.possibleStates.indexOf(newState);
        if (indexState === -1) {
         //   console.log('Shape: ' + this.id + ' - Method:addState - Msg: The state ' + newState + ' was not found for this shape.');
            return false;
        }

        // if the currentState is on, means thats already active
        if (this.currentStates[indexState] == 1) {
         //   console.log('Shape: ' + this.id + ' - Method:addState - Msg: The state ' + newState + ' already exists in this shape.');
            return false;
        }

        // turn on the newState and make the necessary updates
        this.currentStates[indexState] = 1;
        this.updateStateProperties();
        return true;
    }

    /**
     * Remove a current state of the shape
     * @param {string} removeState the state to be disabled
     * @returns {boolean} confirmation
     */
    this.removeState = function (removeState) {

        var indexState = this.possibleStates.indexOf(removeState);
        if (indexState === -1) {
          //  console.log('Shape: ' + this.id + ' - Method:removeState - Msg: The state "' + removeState + '" is not a possible state to this shape.');
            return false;
        }

        // Check if this state is in the list of current states
        if (this.currentStates[indexState] === 0) {
          //  console.log('Shape: ' + this.id + ' - Method:removeState - Msg: The state "' + removeState + '" was not found in this shape.');
            return false;
        }

        // Remove the state from the current states and update shape properties
        this.currentStates[indexState] = 0;
        this.updateStateProperties();
        return true;
    }

    /**
     * This method update the shape properties
     * @returns {boolean} confirmation
     */
    this.updateStateProperties = function () {
        var st = '',
            stProperties = [],
            // If the speedCodeEn is added, Then it'll change all the properties.
            speedcodeActive = this.currentStates.shift();

        if (this.route.flag == 1)
            this.properties['fill'] = mainConfig.states['Route'][this.route.status]['fill'];

        if (this.currentStates.indexOf(1) > -1) {                          // Verify if the currentStates has at least one state added
            for (var i = 0; i < this.currentStates.length; i++) {             // Loop through all the currentStates to find a state added 

                if (this.currentStates[i] == 1) {                         // Verify if it's a state added                  
                    st = this.possibleStates[i + 1];
                    stProperties = mainConfig.states[st][this.active];      // Get all the properties

                    for (var prop in stProperties) {                     // Loop through each prop in properties 
                        if (speedcodeActive) {
                            this.properties[prop] = 'url(#speedcodeen' + (this.active ? '-Active' : '-Inactive') + '-' + st + ')';
                        }
                        else {
                            this.properties[prop] = mainConfig.states[st][this.active][prop];  // set prop state 
                        }
                    }
                }
            }

        }
        else {
            // Set initial state or speedcode 
            stProperties = mainConfig.states['Initial'][this.active];                     // It's used to update when there is no state added  - The 'initial' state is used

            if (this.route.flag == 1)
                stProperties = mainConfig.states['Route'][this.route.status];

            for (var p in stProperties) {                                           // Loop through each prop in properties 
                this.properties[p] = stProperties[p];  // set prop state  
            }

            if (speedcodeActive) {
                this.properties[prop] = 'url(#speedcodeen' + (this.active ? '-Active' : '-Inactive') + ')';
            }
        }

        this.currentStates.unshift(speedcodeActive);

        // This method actually changes the shape properties
        this.setProperties();
        return true;
    }

    /**
     * Change the properties and config variables and also update the shape
     * @param {object} newPropertiesList the new properties
     * @returns {boolean} confirmation
     */
    this.changeProperties = function (newPropertiesList) {

        // Run though the new properties
        for (newProperty in newPropertiesList) {
            // Check if is not a function or method
            if (newPropertiesList.hasOwnProperty(newProperty)) {
                // Check if the new properties is in the config container
                if (newProperty in this.config) {
                    this.config[newProperty] = newPropertiesList[newProperty];
                }
                    // Check if the new property is in the properties container
                else if (newProperty in this.properties) {
                    this.properties[newProperty] = newPropertiesList[newProperty];
                }
            }
        }

        // If the shape has points
        if ('points' in this.properties) {
            // console.log(this.config.form); 
            this.properties.points = this[this.config.form + 'Points']();
        }

        // Update the new properties
        if ('updateProperties' in this) this.updateProperties();
        this.setProperties();
        return true;
    }

    /**
     * Active status change the color and it's used to include tag <use>.
     * @param {string} ElementName the name of the element that should be active
     * @returns {boolean} confirmation
     */
    this.activeState = function (ElementName) {
        // Active the shape state
        this.active = 1;

        // Check if the element name parameter exists
        if (!ElementName) {
           // console.log('Shape: ' + this.id + ' - Method:activeState - Msg: The element name was not provided.');
            return false;
        }

        // Verify if this shape has a id to create a tag <use>. The tag <use> puts the shape in front of other shape.
        if (this.name === 'Rectangle') {
           
            var node = document.getElementById("Use" + this.properties.id)

            if (node == null) {
                var use = document.createElementNS(this.namespace, 'use');
                var elG = document.getElementById(ElementName);
                use.setAttributeNS("http://www.w3.org/1999/xlink", 'href', "#" + this.properties.id);
                use.id = "Use" + this.properties.id;
                elG.appendChild(use);
            }

        }

        this.updateStateProperties();
        return true;
    }

    this.desactiveState = function (ElementName) {

        // Active the shape state
        this.active = 0;

        //alert("ElementName:" + ElementName);
        // Verify if this shape has a id to create a tag <use>. The tag <use> puts the shape in front of other shape.
        if (this.name === "Rectangle") {

            var node = document.getElementById("Use" + this.properties.id);
            var elG = document.getElementById(ElementName);

            //var useTag = elG.getElementById(this.properties.id);
            //var node = elG.has('a[href="#' + this.properties.id + '"]');
            if (node != null) {
                elG.removeChild(node);
            }
        }

        this.updateStateProperties();
        return true;
    }

    /**
     * Change SVG properties according to the state applied
     * Params:
     * - Property: property name 
     * - value: the value of the property
     * @returns {boolean} confirmation
     */
    this.setProperties = function () {
        // Check if the svg element already exists
        if (this.svgElement) {
            // Get all the properties defined in the properties object
            for (prop in this.properties) {
                if (this.properties.hasOwnProperty(prop)) {
                    this.svgElement.setAttribute(prop, this.properties[prop]);
                }
            }

            if ('updateProperties' in this) this.updateProperties();
        }
        else {
         //   console.log('Shape: ' + this.id + ' - Method:setProperties - Msg: SVG Element not created yet.');
            return false;
        }
        return true;
    }

    /**
     * Creates the Element to include in svgContainer 
     * @returns {boolean} confirmation
     */
    this.createShape = function () {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS(this.namespace, this.shape);
            this.setProperties();
        }
        else {
          //  console.log('Shape: ' + this.id + ' - Method:build - Msg: Element already exists.');
            return false;
        }
        return true;
    }

    /**
     * Delete the Element from svgContainer 
     * @returns {boolean} confirmation
     */
    this.deleteElement = function () {
        if (this.svgElement) this.svgElement.remove();
        else {
        //    console.log('Shape: ' + this.id + ' - Method:deleteElement  - Msg: Element not found.');
            return false;
        }
        return true;
    }

}

/**
  * Straight Line  -------
  * It's used to demonstrate the universal crossover direction 
  * Tested Build OK
  * Tested Change Properties OK
  * Tested Change Default States
  */
var Line = function () {
    Shape.call(this);

    this.shape = "line";

    this.config.width = 20;
    this.config.x = 0;
    this.config.y = 0;

    // Specific Properties of the line
    this.properties = {
        x1: 0,
        y1: 0,
        x2: this.config.width,
        y2: 0,
        stroke: mainConfig.colors.lightGray
    };

    // As the line is always straight, then it only needs 
    // the fist point and the width to calculate the second point
    this.updateProperties = function () {
        this.properties.x1 = this.config.x;
        this.properties.y1 = this.config.y;
        this.properties.x2 = this.config.x + this.config.width;
        this.properties.y2 = this.config.y;
    };
}

/**            _________
 * Rectangle  |_________|
 * Representing a CV - Segment
 * Tested Build OK
 * Tested Change Properties OK
 * Tested Change Default States OK
 */
var Rectangle = function () {
    Shape.call(this);

    // Rectangle specificity
    this.shape = 'rect';
    this.name = 'Rectangle';

    this.properties.height = mainConfig.size.proportion;
    this.properties.width = 20;
    this.properties.x = 20;
    this.properties.y = 20;
    this.properties.id = 'rectangle';
    this.properties.visibility = '';
}

/**
 * Circle  
 * - It's used in the speed restriction element
 * Tested Build OK
 * Tested Change Properties OK
 * Tested Change Default States
 */
var Circle = function () {
    Shape.call(this);

    this.shape = 'circle';
    this.config.x = 10;
    this.config.y = 40;
    this.config.width = 8;

    this.properties = {
        cx: this.config.x,
        cy: this.config.y,
        r: this.config.width,
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
        visibility: ''
    }

    this.updateProperties = function () {
        this.properties.cx = this.config.x;
        this.properties.cy = this.config.y;
        this.properties.r = this.config.width;
    };
}

/**
 *
 * Show image on the svg container
 * Tested Build OK
 * Tested Change Properties OK
 * Tested Change Default States
 */
var Image = function () {
    Shape.call(this);

    this.shape = 'image';

    this.config.url = '';
    this.properties = {
        x: 0,
        y: 0,
        width: 100
    }

    // Add url property in the svg element
    this.updateProperties = function () {
        this.svgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.config.url);
    };
}

/**
 *
 * Teste shape to write km and others info
 * Tested Build OK
 * Tested Change Properties OK
 * Tested Change Default States
 */

var Text = function () {
    Shape.call(this);

    this.shape = "text";

    this.config.text = 'text';

    this.properties = {
        x: 0,
        y: 0,
        'text-anchor': "middle",
        'dominant-baseline': "middle",
        'font-size': 12,
        fill: mainConfig.colors.cyan,
        visibility: '',
    };

    this.updateProperties = function () {
        if (this.svgElement) {
            this.svgElement.textContent = this.config.text;
        }
    }

}

/**                __
 *               |_ \
 * Deviation      \ \_
 *                   \__|
 * Tested Build OK
 * Tested Change Properties OK 
 * Tested Change Default States OK
 */
var Deviation = function () {
    Shape.call(this);

    this.name = "Deviation";
    // Shape settings
    this.config = {
        x: 0,
        y: 0,
        // width : 2.2,
        // height : 1,
        form: 'left',
        visibility: '',
    }
    // Polygon specificity
    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
    }

    //[[0,1],[-2,0],[-2,6.5],[-2.7,0],[0,-1],[2,0],[2,-6.5]],
    this.leftPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += -12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += -12) + ' ' + (this.config.y += 39) + ' ' +
            (this.config.x += -16.2) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += -6) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += -39);
    };
    //[[0,1],[2,0],[2,6.5],[2.7,0],[0,-1],[-2,0],[-2,-6.5]],
    this.rightPoints = function () {
        return this.config.x + ' ' + (this.config.y) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += 39) + ' ' +
            (this.config.x += 16.2) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y -= 6) + ' ' +
            (this.config.x -= 12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 12) + ' ' + (this.config.y -= 39);
    };

    this.properties.points = this[this.config.form + 'Points']();
}

/**                
 *                     __
 * Half Deviation      \ \_
 *                       \__|
 * Tested Build OK
 * Tested Change Properties OK
 * Tested Change Default States OK
 */
var HalfDeviation = function () {
    Shape.call(this);
    this.name = "HalfDeviation";
    this.config = {
        x: 0,
        y: 0,
        // width: 0,
        // height: 0,
        form: "topLeft",
        visibility: ''
    }

    // Polygon specificity
    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
    }

    // [[1.14,0],[0.57,2.66],[1,0],[-0.8,-3.61],[-1.90,0]]
    this.topLeftPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x += 6.84) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 3.42) + ' ' + (this.config.y += 15.96) + ' ' +
            (this.config.x += 6) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 4.8) + ' ' + (this.config.y -= 21.66) + ' ' +
            (this.config.x -= 11.40) + ' ' + (this.config.y += 0);
    };

    // [[-1.14,0],[-0.57,2.66],[-1,0],[0.8,-3.61],[1.90,0]]
    this.topRightPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x -= 6.84) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 3.42) + ' ' + (this.config.y += 15.96) + ' ' +
            (this.config.x -= 6) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 4.8) + ' ' + (this.config.y -= 21.66) + ' ' +
            (this.config.x += 11.40) + ' ' + (this.config.y += 0);
    };

    // [[1.90,0],[0.8,-3.61],[-1,0],[-0.57,2.66],[-1.14,0]]
    this.bottomLeftPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x += 11.40) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 4.8) + ' ' + (this.config.y -= 21.66) + ' ' +
            (this.config.x -= 6) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 3.42) + ' ' + (this.config.y += 15.96) + ' ' +
            (this.config.x -= 6.84) + ' ' + (this.config.y += 0);
    };

    // [[-1.90,0],[-0.8,-3.61],[1,0],[0.57,2.66],[1.14,0]]
    this.bottomRightPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x -= 11.40) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 4.8) + ' ' + (this.config.y -= 21.66) + ' ' +
            (this.config.x += 6) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 3.42) + ' ' + (this.config.y += 15.96) + ' ' +
            (this.config.x += 6.84) + ' ' + (this.config.y += 0);
    };

    this.properties.points = this[this.config.form + 'Points']();
}

/**
 *                          
 * SmallHalfDeviation   
 *         
 * Tested Build OK
 * Tested Change Properties ok 
 * Tested Change Default States OK
 */
var SmallHalfDeviation = function () {
    Shape.call(this);

    this.config = {
        x: 0,
        y: 0,
        form: 'right',
    }
    // Polygon specificity
    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
        visibility: '',
    }

    //[[0,1],[-2,0],[-2,6.5],[-2.7,0],[0,-1],[2,0],[2,-6.5]],
    this.leftPoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        return (x1) + ' ' + (y1) + ' ' +
            (x1 += 0) + ' ' + (y1 += 2.4) + ' ' +
            (x1 += -2.9 * 3.5) + ' ' + (y1 += 0 * 3.5) + ' ' +
            (x1 += -1 * 3.5) + ' ' + (y1 += 1.62 * 3.5) + ' ' +
            (x1 += -3.5 * 3.5) + ' ' + (y1 += 0 * 3.5) + ' ' +
            (x1 += 0 * 3.5) + ' ' + (y1 += -2.4) + ' ' +
            (x1 += 2.9 * 3.5) + ' ' + (y1 += 0 * 3.5) + ' ' +
            (x1 += 1 * 3.6) + ' ' + (y1 += -1.62 * 3.5);
    };
    //[[0,1],[2,0],[2,6.5],[2.7,0],[0,-1],[-2,0],[-2,-6.5]],
    this.rightPoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        return (x1) + ' ' + (y1) + ' ' +
            (x1 += 0) + ' ' + (y1 += 2.4) + ' ' +
            (x1 += 2.9 * 3.5) + ' ' + (y1 += 0 * 3.5) + ' ' +
            (x1 += 1 * 3.5) + ' ' + (y1 += 1.62 * 3.5) + ' ' +
            (x1 += 3.5 * 3.5) + ' ' + (y1 += 0 * 3.5) + ' ' +
            (x1 += 0 * 3.5) + ' ' + (y1 += -2.4) + ' ' +
            (x1 -= 2.9 * 3.5) + ' ' + (y1 += 0 * 3.5) + ' ' +
            (x1 -= 1 * 3.6) + ' ' + (y1 += -1.62 * 3.5);
    };


    this.properties.points = this[this.config.form + 'Points']();

}


/**               
 *                 /\
 * Triangle     /__\
 *        
 * Tested Build OK
 * Tested Change Properties OK 
 * Tested Change Default States           
 */
var Triangle = function () {
    Shape.call(this);

    this.config = {
        x: 0,
        y: 0,
        width: 2.2,
        height: 1,
        form: 'rectangle',
        visibility: '',
    }

    this.properties = {
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray
    }

    // We need to create a function to fill theses values. 
    // [[0,0],[width, height],[-width,0],[0,-height]]  
    this.rectanglePoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        var p = mainConfig.size.proportion;
        return x1 + ' ' + this.config.y + ' ' +
            (x1 += this.config.width * p) + ' ' + (y1 += this.config.height * p) + ' ' +
            (x1 -= this.config.width * p) + ' ' + y1 + ' ' +
            x1 + ' ' + (y1 -= this.config.height * p);
    };

    // Right Points
    // [[0,0], [0,-height], [width,height/2]]
    this.rightPoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        var p = mainConfig.size.proportion;
        return x1 + ' ' + y1 + ' ' +
            x1 + ' ' + (y1 -= this.config.height * p) + ' ' +
            (x1 += this.config.width * p) + ' ' + (y1 += (this.config.height / 2) * p);
    };

    // Isosceles
    // [[0,0], [width/2, -height], [width/2, height]]
    this.isoscelesPoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        var p = mainConfig.size.proportion;
        return x1 + ' ' + y1 + ' ' +
            (x1 += (this.config.width / 2) * p) + ' ' + (y1 -= this.config.height * p) + ' ' +
            (x1 += (this.config.width / 2) * p) + ' ' + (y1 += this.config.height * p);
    };

    this.properties.points = this[this.config.form + 'Points']();
}

/**              
 * Arrow  |> or <|
 *    
 * Tested Build Ok
 * Tested Change Properties OK
 * Tested Change Default States           
 */
var Arrow = function () {
    Shape.call(this);

    // this.vPosition = 'top';
    this.config.x = 0;
    this.config.y = 0;
    this.config.width = 20;
    this.config.form = 'up';

    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
        visibility: ''
    }

    // [[0,0],[width*0.55,-width*0.88],[width*0.55,width*0.88],[-width*0.44,0],[0,width],[-width*0.22,0],[0,-width]],
    this.upPoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        

        return x1 + ' ' + y1 + ' ' +
            (x1 += this.config.width * 0.55) + ' ' + (y1 -= this.config.width * 0.88) + ' ' +
            (x1 += this.config.width * 0.55) + ' ' + (y1 += this.config.width * 0.88) + ' ' +
            (x1 -= this.config.width * 0.44) + ' ' + y1 + ' ' +
            x1 + ' ' + (y1 += this.config.width) + ' ' +
            (x1 -= this.config.width * 0.22) + ' ' + y1 + ' ' +
            x1 + ' ' + (y1 -= this.config.width);
    };

    // [[0,0],[width*0.55,width*0.88],[width*0.55,-width*0.88],[-width*0.44,0],[0,-width*1.11],[-0.22*width,0],[0,width*1.11]]
    this.downPoints = function () {
        var x1 = this.config.x;
        var y1 = this.config.y;
        return x1 + ' ' + y1 + ' ' +
            (x1 += this.config.width * 0.55) + ' ' + (y1 += this.config.width * 0.88) + ' ' +
            (x1 += this.config.width * 0.55) + ' ' + (y1 -= this.config.width * 0.88) + ' ' +
            (x1 -= this.config.width * 0.44) + ' ' + y1 + ' ' +
            x1 + ' ' + (y1 -= this.config.width * 1.11) + ' ' +
            (x1 -= this.config.width * 0.22) + ' ' + y1 + ' ' +
            x1 + ' ' + (y1 += this.config.width * 1.11);
    };

    this.properties.points = this[this.config.form + 'Points']();
}

/**
 *
 * Speed Restriction
 *
 * Tested Build OK
 * Tested Change Properties  OK
 *
 */

var Restriction = function () {
    Shape.call(this);

    this.config.x = 0;
    this.config.y = 0;
    this.config.width = 10;
    // this.config.height = 20;

    this.properties = {
        points: '',
        fill: mainConfig.colors.lightYellow,
        stroke: mainConfig.colors.freeSpeechRed,
        visibility: ''
    }

    // [[0,0],[1.2,-0.6],[1*width,0],[1.2,0.6],[-1.2,0.6],[-1*width,0]],
    this.defaultPoints = function () {
        var p = mainConfig.size.proportion;
        return this.config.x + ' ' + this.config.y + ' ' +
            (this.config.x += 1.2 * p) + ' ' + (this.config.y -= 0.6 * p) + ' ' +
            (this.config.x += this.config.width * p) + ' ' + this.config.y + ' ' +
            (this.config.x += 1.2 * p) + ' ' + (this.config.y += 0.6 * p) + ' ' +
            (this.config.x -= 1.2 * p) + ' ' + (this.config.y += 0.6 * p) + ' ' +
            (this.config.x -= this.config.width * p) + ' ' + this.config.y;
    }

    this.properties.points = this.defaultPoints();
}

/**                __
 *               |_ \
 * Deviation      \ \_
 *                   \__|
 * Tested Build OK
 * Tested Change Properties OK 
 * Tested Change Default States OK
 */
var SkinnyDeviation = function () {
    Shape.call(this);

    this.name = "Deviation";
    // Shape settings
    this.config = {
        x: 0,
        y: 0,
        // width : 2.2,
        // height : 1,
        form: 'left',
        visibility: '',
    }
    // Polygon specificity
    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
    }

    //[[0,1],[-2,0],[-2,6.5],[-2.7,0],[0,-1],[2,0],[2,-6.5]],
    this.leftPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += -5) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 14) + ' ' + (this.config.y += 39) + ' ' +
            (this.config.x += -8) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y -= 6) + ' ' +
            (this.config.x += 4) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 14) + ' ' + (this.config.y -= 39) + ' ';
    };
    //[[0,1],[2,0],[2,6.5],[2.7,0],[0,-1],[-2,0],[-2,-6.5]],
    this.rightPoints = function () {
        return this.config.x + ' ' + (this.config.y) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += 39) + ' ' +
            (this.config.x += 16.2) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y -= 6) + ' ' +
            (this.config.x -= 12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x -= 12) + ' ' + (this.config.y -= 39);
    };

    this.properties.points = this[this.config.form + 'Points']();
}


var location858 = function () {
    Shape.call(this);

    this.name = "Deviation";
    // Shape settings
    this.config = {
        x: 0,
        y: 0,
        form: 'left',
        visibility: '',
    }
    // Polygon specificity
    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
    }

    //[[0,1],[-2,0],[-2,6.5],[-2.7,0],[0,-1],[2,0],[2,-6.5]],
    this.leftPoints = function () {
        return (this.config.x) + ' ' + (this.config.y) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += -30) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += -26) + ' ' + (this.config.y += 78) + ' ' +
            (this.config.x += -32) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += -6) + ' ' +
            (this.config.x += 28) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 25) + ' ' + (this.config.y += -78);
    };

    this.properties.points = this[this.config.form + 'Points']();
}

var LocationN = function () {
    Shape.call(this);

    this.name = "Deviation";
    // Shape settings
    this.config = {
        x: 0,
        y: 0,
        form: 'left',
        visibility: '',
    }
    // Polygon specificity
    this.properties = {
        points: '',
        fill: mainConfig.states.Initial[this.active].fill,
        stroke: mainConfig.colors.gray,
    }

    //[[0,1],[-2,0],[-2,6.5],[-2.7,0],[0,-1],[2,0],[2,-6.5]],
    this.leftPoints = function () {
        return (this.config.x += 30) + ' ' + (this.config.y) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += -25) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += -3) + ' ' +
            (this.config.x += 13) + ' ' + (this.config.y += -42) + ' ' +
            (this.config.x += 12) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += 0) + ' ' + (this.config.y += 6) + ' ' +
            (this.config.x += -8) + ' ' + (this.config.y += 0) + ' ' +
            (this.config.x += -10) + ' ' + (this.config.y += 33);
    };

    this.properties.points = this[this.config.form + 'Points']();
}
/*=====  End of Section comment block  ======*/


