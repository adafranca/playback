/*=============================================
=            Playback Routes            =
=============================================*/
/**
 * 
 * 
 *
 */

/**
 * Route Class ---
 * 
 * Route class is responsable for create all the routes and the changes necessary if the status change. 
 */

function Route(location, description, status) {

    
    this.svgContainer = document.getElementById('svgPrincipal');

    this.namespace = "http://www.w3.org/2000/svg"; // 

    this.segments = [];

    this.status = status;   // Register; Grant; TimeLock 

    this.status1 = []; this.status1.push(status);

    this.location = location; // KM 

    this.name = description;

    this.elG;

    this.description = description;

    this.direction = 1;  // Direction -1 or 1 indicates the direction that a route will be draw.
    
    // A route can start from a WT or Switch
    this.positions = { 'A': [1, 'left'], 'B': [1, 'right'], 'C': [2, 'left'], 'D': [2, 'right'], 'Normal': [0, 1], 'Reverse': [1, 2] };

    /*
     * positionsWT is an object to set each shape about a WT. e.g If the description is AB, the first shape is track 1 left side, 'A':[1, 'left']
     */
    this.positionsWT = { 'A': [1, 'left'], 'B': [1, 'right'], 'C': [2, 'left'], 'D': [2, 'right'] };

    /*
     * positionsSwitch is an object to set each shape about a Switch. The first element indicates each shape number and the second indicates the end track.
     * e.g A Reverse status indicates that a shape[0] (Deviation) will be part of a route.     
     */

    this.positionsSwitch = { 'Reverse' : [1], 'Normal': [0]}

    this.arrow = {};  // Each route has to draw a arrow

    this.element = ""; //Init Element: UniversalCrossOver or Switch 

    this.initTrack = 1; // Indicates the initTrack of a route

    this.endTrack = 0; // Indicates the endTrack of a route

    this.place = "SLZ";  // Indicates the direction Switch - It's just used from Switch elements. Used to verify the route's direction. e.g  A RSLZ02II is setted to a switch to direction SLZ. 

    // Function to find which element is the first - UniversalCrossover or Switch 

    this.findElement = function () {

        if (this.description.indexOf("RFSP") > -1) {
            var description = this.description.split("_")[1];
            this.element = "Switch";
            switch (description) {
                case "AB":
                    this.direction = 1;
                    this.description = "Normal";
                    break;
                case "BA":
                    this.direction = -1;
                    this.description = "Normal";
                    break;
                case "BC":
                    this.direction = -1;
                    this.description = "Reverse";
                    break;
                case "CB":
                    this.direction = 1;
                    this.description = "Reverse";
                    break;
            }
            return;
        }

        if (this.description.indexOf("_") > -1) {
            this.description = this.description.split("_")[1];
            this.element = "UniversalCrossover";
            return;
        }

        this.element = "Switch";
    }

    this.findDescription = function(){

        var indexCAR = this.description.indexOf("CAR");
        var indexSLZ = this.description.indexOf("SLZ");

        // First : Find Direction
        // If true, this is a switch to carajas. 
       
        if (indexCAR > -1) {
            this.place = "CAR";
            this.findDirectionSwitch(indexCAR, -1);
        }

        if (indexSLZ > -1) {
            this.place = "SLZ";
            this.findDirectionSwitch(indexSLZ, 1);
        }
    }

    function convertRomanToInt(romanNumber) {
        var number = 1;
        switch (romanNumber) {
            case "I":
                number = 1;
                break;
            case "II":
                number = 2;
                break;
            case "III":
                number = 3;
                break;
            case "IV":
                number = 4;
                break;
            case "V":
                number = 5;
                break;
        }

        return number;
    }

    this.findDirectionSwitch = function (index, direction) {

        index += 3;

        // Get Init 
        if (!isNaN(this.description[index])) {
            index += 1;
            this.direction = direction;
            this.initTrack = this.description[index];
        }
        else {
            var init = index;
            while (isNaN(this.description[index])) {   
                index += 1;
            }
            
            init = this.description.substring(init, index);
            this.initTrack = convertRomanToInt(init);
            this.direction = direction * (-1);
        }

        index += 1;

        // Get End
        if (!isNaN(this.description[index])) {
            if (this.description[index] == 0)
                index += 1;
            this.endTrack = this.description[index];
        }
        else {
            var last = this.description.substring(index, this.description.length);
            this.endTrack = convertRomanToInt(last);
        }

        this.description = (this.initTrack != this.endTrack) ? "Reverse" : "Normal";
        
    }

    this.build = function (elements) {

        if (!this.description)
            return;

        // Find the first element, WT or Switch
        this.findElement();

        if (this.element === "Switch")
            this.findDescription();
        
        var specificCase = mainConfig.specificCaseRoute[this.location + "_" + this.name];

        if (specificCase != undefined)
            this.routeSpecific(elements, specificCase);
        else
           (this.element === "UniversalCrossover") ? this.routeWT(elements) : this.routeSwitch(elements);
        
        this.create();

    }

    this.routeSpecific = function (elements, specificCase) {

        var directionsReverse = ["BC", "DA", "DC", "BA"];
        var width = 0;

        //  Verify if the route it's a Reverse route  
        if (directionsReverse.indexOf(this.description) > -1) {
            i = keys.length - 1;
            this.direction = -1;
        }

        for (var i = 0; i < specificCase.elements.length; i++) {
            this.segments.push(elements[specificCase.elements[i]]);
        }

        var width = 0, y;

        if (this.direction == 1)
            width = this.segments[this.segments.length - 1].width;
        
        y = this.segments[this.segments.length - 1].y;

        if (this.segments[this.segments.length - 1].constructor.name === "UniversalCrossover") {
            var element = document.getElementById(this.segments[this.segments.length - 1].name + this.description.split('')[1]);
            y = parseInt(element.getAttribute("y"));
        }

        if (this.segments[this.segments.length - 1].constructor.name === "Switch" && this.element === "Switch") {
            if (this.description === "Reverse")
                y = mainConfig.track[this.endTrack].y;
        }

        this.createArrow(this.segments[this.segments.length - 1].x + width, y + 9);

    }

    this.createArrow = function(x,y){
        this.arrow = new Triangle();
        this.arrow.changeProperties({ x: x, y: y, form: "right", width: this.direction * 1.3, height: 2.2, fill: mainConfig.colors.green, stroke: mainConfig.colors.green });
        this.arrow.createShape();
        this.elG = document.createElementNS(this.namespace, 'g');
        this.elG.appendChild(this.arrow.svgElement);
        this.svgContainer.appendChild(this.elG);
    }

    this.routeWT = function (elements) {

        var i = 0;
        var keys = Object.keys(elements);
        this.direction = 1;
        
        var firstelement = "WT" + ((this.name.indexOf("I") > -1) ? "II" : "");
       
        // this.description = this.description.split("_")[1];
        var track = this.positionsWT[this.description.split('')[1]][0] + ((firstelement == "WTII") ? 1 : 0);

        var directions = ["BC", "DA", "DC", "BA"];
        var width = 0;

        //  Verify if the route it's a counter route  
        if (directions.indexOf(this.description) > -1) {
            i = keys.length - 1;
            this.direction = -1;
        }

        while (i < keys.length && i >= 0) {

                var segment = elements[keys[i]];

                var segment_location = keys[i].split('_')[0];

                var name = keys[i].split('_')[1];

                // Second case: Add segment after a WT 
                if (segment.track[0] == track && this.segments.length > 0 && name != "WT" && name != "WTII" && name != "SW01T" && name != "SW03T" && name != "TE01") {
                    this.segments.push(segment);
                }

                // Third Case: Last WT 
                if ((name === "WT" || name === "CV03C" || name === "CV03B" || name === "SW01T" || name === "TE01" || name === "SW03T" || i == keys.length - 1 || i == 0) && this.segments.length >= 1) {

                    if (this.direction == 1)
                        width = this.segments[this.segments.length - 1].width;

                    var y = this.segments[this.segments.length - 1].y;

                    if (this.segments[this.segments.length - 1].constructor.name === "UniversalCrossover") {
                        var element = document.getElementById(this.segments[this.segments.length - 1].name + this.description.split('')[1]);
                        y = parseInt(element.getAttribute("y"));
                    }

                    this.createArrow(this.segments[this.segments.length - 1].x + width, y + 9);

                    break;
                }

                // First case: Add first WT 
                if (name == firstelement && this.location == segment_location) {
                    this.segments.push(segment);
                }

                i += this.direction;

            }

    }

    this.routeSwitch = function (elements) {

       // this.description = this.description.split("_")[1];
        var i = 0;
        var operation = 1;  // Variable used to set to add or subtract 
        var keys = Object.keys(elements);
        var width = 0,y;

        i = (this.direction == -1) ? keys.length - 1 : 0;

        // RSLZ01I
        while (i < keys.length && i >= 0) {

            var segment = elements[keys[i]];

            var segment_location = keys[i].split('_')[0];

            var tracksegmentinit = (this.description === "Reverse") ? segment.trackReverse : segment.track[0];

            // Second case: Add segment after a WT 
            if (segment.track[0] == this.endTrack && this.segments.length > 0 && segment.constructor.name != "UniversalCrossover" && segment.constructor.name != "Switch") {
                this.segments.push(segment);
            }

            // Third Case: Last WT 
            if ((segment.constructor.name === "Switch" || segment.constructor.name === "UniversalCrossover" || i == keys.length - 1 || i == 0) && this.segments.length >= 1) {
              
                if (this.direction == 1) {
                    width = this.segments[this.segments.length - 1].width;
                }

                if (this.segments[this.segments.length - 1].constructor.name === "UniversalCrossover") {
                    var element = document.getElementById(this.segments[this.segments.length - 1].name + this.description.split('')[1]);
                    y = parseInt(element.getAttribute("y"));
                }

                if (this.segments[this.segments.length - 1].constructor.name === "Switch") {
                    if (this.description === "Reverse")
                        y = mainConfig.track[this.endTrack].y - 16;

                }

                this.createArrow(this.segments[this.segments.length - 1].x + width, this.segments[this.segments.length - 1].y + 9);
                break;
            }

            // First case: Add first Switch 
            if (segment.constructor.name === "Switch" && segment.name.indexOf("TE") == -1 && this.location == segment_location && tracksegmentinit == this.initTrack && this.place == segment.dir) {
                this.segments.push(segment);
            }

            i += this.direction;

        }


    }

    this.create = function () {
        
        if (this.element === "UniversalCrossover") {
            var first = this.description.split('')[0];
            var last = this.description.split('')[1];

            var trackInit = this.positionsWT[first][0];
            var trackLast = this.positionsWT[last][0];

            var sideInit = this.positionsWT[first][1];
            var sideLast = this.positionsWT[last][1]
        }

        for (var i = 0; i < this.segments.length; i++) {

            if (this.segments[i].constructor.name == "UniversalCrossover") {

                if (this.description == "AB" || this.description == "CD" || this.description == "BA" || this.description == "DC") {

                    this.segments[i].shapes[trackInit][sideInit]['Rectangle'].route = { flag: 1, status: this.status };
                    this.segments[i].shapes[trackInit][sideInit]['Rectangle'].activeState(this.segments[i].name);
                    this.segments[i].shapes[trackInit][sideInit]['Rectangle'].updateStateProperties();
                    this.segments[i].shapes[trackLast][sideLast]['Rectangle'].route = { flag: 1, status: this.status };
                    this.segments[i].shapes[trackLast][sideLast]['Rectangle'].activeState(this.segments[i].name);
                    this.segments[i].shapes[trackLast][sideLast]['Rectangle'].updateStateProperties();
                }

                if (this.description == "AD" || this.description == "CB" || this.description == "BC" || this.description == "DA") {
                    var trackRectangle = trackInit;
                    
                    if ((this.segments[i].flag == 1 && (this.description === "AD" || this.description === "BC")) || (this.segments[i].flag == 0 && (this.description === "DA" || this.description === "CB")) ) {
           
                        sideInit = (sideInit == "left") ? "right" : "left";
                        sideLast = (sideLast == "left") ? "right" : "left";
                        trackRectangle = (trackInit == 1) ? 2 : 1;
                    }

                    this.segments[i].shapes[trackRectangle][sideInit]['Rectangle'].route = { flag: 1, status: this.status };
                    this.segments[i].shapes[trackRectangle][sideInit]['Rectangle'].activeState(this.segments[i].name);
                    this.segments[i].shapes[trackRectangle][sideInit]['Rectangle'].updateStateProperties();

                    this.segments[i].shapes[trackInit][sideLast]['HalfDeviation'].route = { flag: 1, status: this.status };
                    this.segments[i].shapes[trackInit][sideLast]['HalfDeviation'].updateStateProperties();

                    this.segments[i].shapes[trackLast][sideLast]['HalfDeviation'].route = { flag: 1, status: this.status };
                    this.segments[i].shapes[trackLast][sideLast]['HalfDeviation'].updateStateProperties(); 

                }

            }

            if (this.segments[i].constructor.name === "Switch" && i == 0) {
                var shape = this.positionsSwitch[this.description][0];
                this.segments[i].shapes[shape].activeState(this.segments[i].name);
                this.segments[i].shapes[shape].route = { flag: 1, status: this.status1[this.status1.length-1] };
                this.segments[i].shapes[shape].updateStateProperties();
                continue;
            }

            if (this.segments[i].constructor.name === "Segment" || this.segments[i].constructor.name === "Segment858") {
                this.segments[i].shapes[0].route = { flag: 1, status: this.status };
                this.segments[i].shapes[0].updateStateProperties();
            }

            if (this.segments[i].constructor.name === "Switch") {
                this.segments[i].shapes[0].activeState(this.segments[i].name);
                this.segments[i].shapes[0].route = { flag: 1, status: this.status1[this.status1.length - 1] };
                this.segments[i].shapes[0].updateStateProperties();
            }

        }

        if (this.arrow.config != undefined) // +16
            this.arrow.changeProperties({ x: this.arrow.config.x, y: this.arrow.config.y, fill: mainConfig.states.Route[this.status1[this.status1.length - 1]].fill, stroke: mainConfig.states.Route[this.status1[this.status1.length - 1]].fill });
    }

    this.changeStatus = function (status) {
        
        this.status = status;

        this.status1.push(status);

        this.create();

    }

    this.destroy = function (status) {

        var index = this.status1.indexOf(status);
        
        if (index >= 0) {
            this.status1.splice(index, 1);
        }
        else
            return false;

        if (this.status1.length == 0) {

            if (this.description == undefined)
                return;

            if (this.element === "UniversalCrossover") {
                var first = this.description.split('')[0];
                var last = this.description.split('')[1];

                var trackInit = this.positionsWT[first][0];
                var trackLast = this.positionsWT[last][0];

                var sideInit = this.positionsWT[first][1];
                var sideLast = this.positionsWT[last][1]
            }

            for (var i = 0; i < this.segments.length; i++) {

                if (this.segments[i].constructor.name === "UniversalCrossover") {

                    if (this.description == "AB" || this.description == "CD" || this.description == "BA" || this.description == "DC") {

                        this.segments[i].shapes[trackInit][sideInit]['Rectangle'].route = { flag: 0, status: status };
                        //   this.segments[i].shapes[trackInit][sideInit]['Rectangle'].desactiveState(this.segments[i].name);
                        this.segments[i].shapes[trackInit][sideInit]['Rectangle'].updateStateProperties();

                        this.segments[i].shapes[trackLast][sideLast]['Rectangle'].route = { flag: 0, status: status };
                        //   this.segments[i].shapes[trackLast][sideLast]['Rectangle'].desactiveState(this.segments[i].name);
                        this.segments[i].shapes[trackLast][sideLast]['Rectangle'].updateStateProperties();
                    }

                    if (this.description == "AD" || this.description == "CB" || this.description == "BC" || this.description == "DA") {

                        var trackRectangle = trackInit;

                        if (this.segments[i].flag == 1 && (this.description === "AD" || this.description === "BC")) {
                            sideInit = (sideInit == "left") ? "right" : "left";
                            sideLast = (sideLast == "left") ? "right" : "left";
                            trackRectangle = (trackInit == 1) ? 2 : 1;
                        }

                        this.segments[i].shapes[trackRectangle][sideInit]['Rectangle'].route = { flag: 0, status: status };
                        //    this.segments[i].shapes[trackRectangle][sideInit]['Rectangle'].desactiveState(this.segments[i].name);
                        this.segments[i].shapes[trackRectangle][sideInit]['Rectangle'].updateStateProperties();

                        this.segments[i].shapes[trackInit][sideLast]['HalfDeviation'].route = { flag: 0, status: status };
                        //    this.segments[i].shapes[trackInit][sideLast]['HalfDeviation'].desactiveState(this.segments[i].name);
                        this.segments[i].shapes[trackInit][sideLast]['HalfDeviation'].updateStateProperties();

                        this.segments[i].shapes[trackLast][sideLast]['HalfDeviation'].route = { flag: 0, status: status };
                        //      this.segments[i].shapes[trackLast][sideLast]['HalfDeviation'].desactiveState(this.segments[i].name);
                        this.segments[i].shapes[trackLast][sideLast]['HalfDeviation'].updateStateProperties();

                    }

                }

                if (this.segments[i].constructor.name === "Switch" && i == 0) {

                    var shape = this.positions[this.description][0];

                    this.segments[i].shapes[shape].route = { flag: 0, status: status };
                    //   this.segments[i].shapes[shape].desactiveState(this.segments[i].name);
                    this.segments[i].shapes[shape].updateStateProperties();
                    continue;
                }

                if (this.segments[i].constructor.name == "Segment") {
                    this.segments[i].shapes[0].route = { flag: 0, status: status };
                    this.segments[i].shapes[0].updateStateProperties();
                }

                if (this.segments[i].constructor.name == "Switch") {

                    this.segments[i].shapes[0].route = { flag: 0, status: status };
                    //   this.segments[i].shapes[0].desactiveState(this.segments[i].name);
                    this.segments[i].shapes[0].updateStateProperties();

                }

            }

            this.elG.setAttribute("opacity", "0");

            return true;
        }
        
        return false;
    }

}