/*=============================================
=            Playback TrackBuilder            =
=============================================*/
/**
 * Class Responsable for the construction of the tracks in the SVG Panel
 * It will receive the elements from the Web Service and build the images in canvas.
 * 
 */

function TrackBuilder() {

    // The SVG panel that will be used to build the rail
    this.svgPrincipal = $("#svgPrincipal");

    // The segments that was received from the WS
    this.Elements = {};

    // The space that will be used between the shapes
    this.spacer = mainConfig.size.separator;

    // Receive all the sizes of each element - WT,TE,SBA,DD
    this.widthElements = mainConfig.widthElements;

    // The elements are build only when an UC or a Switch is found, 
    // so they're saved in this variable, to be mounted later
    this.elementsHeap = { Track1: [], Track2: [], Track3: [], Track4: [],Track5: [] };

    // List of the new elements created over the WS data
    this.objSegments = {};

    this.dds = {};

    this.locations = [];
    
    // Clean up the svg panel
    this.clean = function () {
        this.svgPrincipal.empty();
        this.locations = [];
        this.objSegments = {};
    }

    // Create the kms based in the elements 
    // Receive the WS elements and the initial and final x coord
    this.createKMs = function (elementsWS, startCoordX, endCoordX) {

        // Clean the objects saved from the previous construction
        this.objSegments = {};

        // Save the web service elements
        this.Elements = elementsWS;

        var lastLocation = -1, // Keep track of the last location (KM) being used to draw the km element
            currentElement, // current segment being used in the loop
            elementsDefaultBuild = ['WT', 'CV03C', 'CV03B','TE' /*,'SW03T'*/] // the UC/SW that will trigger the construction of the heap
        countKMText = 0;

        for (var i = 0; i < this.Elements.length; i++) {
            
            // Set the elements id, that is used to quickly identify
            // the element in the objElements variable
            currentElement = this.Elements[i];
            if (currentElement) {
                currentElement.id = currentElement.Location + '_' + currentElement.Name;

                // set the element index
                currentElement.index = i;
            }


            // Check if it's a fixed element SW/UC
            if (elementsDefaultBuild.indexOf(currentElement.Name) > -1 || currentElement.id == "717_SW03T" || currentElement.id == '875_SW01T') {

                // When is a Switch or a UC, the heap is drawed and emptied, 
                // returning the new start x to every track
                startCoordX = this.buildHeap(startCoordX, endCoordX, (currentElement.Name=='TE'));

                if (this.buildWT(currentElement, startCoordX)) {   // Build WT
                    startCoordX += this.widthElements["WT"] + this.spacer;
                }

                // Check: it's a switch?
                if (mainConfig.switchs.indexOf(currentElement.Name) > -1) {   // Build Switch
                    this.buildSwitch(currentElement, startCoordX);
                    startCoordX += this.widthElements["Switch"] + this.spacer;
                }
            }
            else {
                // if is not an Switch or an UC, check if it has an anomaly
                this.findSpecificCase(currentElement);

                // Add the segment to the respective track heap, don't draw
                this.elementsHeap['Track' + currentElement.Track].push(currentElement);
            }

            // update the last location 
            if (lastLocation != currentElement.Location && this.locations.length < 3) {
             //   var width = (startCoordX - endCoordX)/2
              //  var text = new KmText(width, 55, currentElement.Location).build(); // Create KMText
                lastLocation = currentElement.Location;
                this.locations.push(currentElement.Location);
                
            }
        }

        // draw everything that was left in the track heap
        endCoordX = this.buildHeap(startCoordX, endCoordX);

        var width = endCoordX / this.locations.length;
        var pos = 50;
        for (var i = 0; i < this.locations.length; i++) {
            var text = new KmText(pos, 55, this.locations[i]);
            text.build();
            pos += width;
        }

        return this.objSegments;
    }

    this.createDDs = function (derailmentdetecters) {

        for (var i = 0; i < derailmentdetecters.length; i++) {
         
            var dd = derailmentdetecters[i];
            var segment = null;

            segment = this.objSegments[dd.km + "_" + dd.segment];

            if (segment != null) {
                var width = segment.width;
                var positionDDreal = Math.abs(dd.position - dd.start_segment);
                var widthsegmentreal = dd.width_segment;
                var DDx = (positionDDreal / widthsegmentreal) * width;
                var objDD = new DerailmentDetecter(dd.name, segment.x + DDx, segment.track);
                objDD.build();
                this.dds[dd.name] = objDD;

            }
        }

        return this.dds;

    }


    /** Every time a element is found that is not an UC or a Switch, 
     * it's stored in a list to be drawed later
     * Then, when an UC or a Switch is founded, the list is drawed
     */
    this.buildHeap = function (startCoordX, endCoordX, hasTEName) {

        // variable to check if is the last element in the track 3 list
        var track3LastPosition;

        endCoordX = this.getEndCoordX(this.elementsHeap.Track1, this.elementsHeap.Track2, startCoordX);

        // Build Track 1
        this.buildSegments(this.elementsHeap.Track1, startCoordX, endCoordX + (hasTEName?47:0));

        // Build Track 2
        this.buildSegments(this.elementsHeap.Track2, startCoordX, endCoordX);

        // Build Track 3
        if (this.elementsHeap.Track3.length) {
            track3LastPosition = 0;

            // Check if the next element in the elements list exists
            nextElementIndex = this.elementsHeap.Track3[this.elementsHeap.Track3.length - 1].index + 1;

            if (this.Elements[nextElementIndex]) {
                track3LastPosition = this.Elements[nextElementIndex].coordX;
            }else
                track3LastPosition = endCoordX;

            this.buildSegments(this.elementsHeap.Track3, this.Elements[this.elementsHeap.Track3[0].index - 1].coordX, track3LastPosition);
        }

        // Build Track 4
        if (this.elementsHeap.Track4.length)
            this.buildSegments(this.elementsHeap.Track4, this.Elements[this.elementsHeap.Track4[0].index - 1].coordX, this.Elements[this.elementsHeap.Track4[this.elementsHeap.Track4.length - 1].index + 1].coordX);

        if (this.elementsHeap.Track5.length) // this.elementsHeap.Track5[this.elementsHeap.Track5.length - 1].coordX
        {
            this.buildSegments(this.elementsHeap.Track5, this.elementsHeap.Track5[0].coordX, this.objSegments['858_CDV_3D1T'].x + 230);
        }
        


        // Clean the segments from the track because 
        // they were already drawed in the SVG Panela
        for (var trackId = 1; trackId < 6; trackId++) {
            this.elementsHeap['Track' + trackId] = [];
        }

        // return the end of the coord X to be 
        // updated in the createKms method
        return endCoordX;
    }

    /**			    
     *			 
     * Function buildSegments	 
     *			 	  
     * Get all the Segments before one Separator {WT, CV03C, CV03B, SW03T} and construct them for each case.
     * The Elements can be Switch(42px), WTII(53px), DD(5px), SBA(80px) and CDV(variable width).
     * @param {Array Elements} All the Segments from a specific track to be build.
     * @param {startCoordX} Start position to build the elements.
     * @param {lastposition} End position to build the elements.
     * @returns nothing.
     */
    this.buildSegments = function (Elements, startCoordX, lastposition) {
        
        var width = this.calculateWidth(Elements, startCoordX, lastposition),
            currentElement = null,
            newElement;

        for (var j = 0; j < Elements.length; j++) {

            //set the current element being used
            currentElement = Elements[j];

            this.findSpecificCase(currentElement);

            console.log(currentElement.id);

            // If the element doesn't have a coordX, start with the initial position
            if (!currentElement.coordX)
                currentElement.coordX = startCoordX; // The real position in px will be set to each element.

            // Switchs
            if (mainConfig.switchs.indexOf(currentElement.Name) > -1) {
                this.buildSwitch(currentElement, startCoordX)
                startCoordX += this.widthElements["Switch"] + this.spacer;
            }
                // WTII
            else if (currentElement.Name == "WTII") {
                var newElement = new UniversalCrossover(currentElement.id, startCoordX, currentElement.Track, 1);
                newElement.build();
                this.objSegments[currentElement.id] = newElement;
                startCoordX += this.widthElements["WT"] + this.spacer;
            }
                // CDV
            else {
                
                if (currentElement.Width) {
                    newElement = new Segment(currentElement.id, currentElement.Track, startCoordX, width + currentElement.Width);
                    startCoordX += width + currentElement.Width + this.spacer;

                }
                else if (currentElement.Name == "CDV_WT") {
                    width = 40;
                    newElement = new Segment(currentElement.id, currentElement.Track, startCoordX, width);
                }
                else if (currentElement.Name.match("DD")) {
                    newElement = this.buildDD(currentElement);
                }
                else if (currentElement.Name.match("SBA")) {
                    newElement = new Segment(currentElement.id, currentElement.Track, startCoordX, 80);
                    startCoordX += this.widthElements["SBA"] + this.spacer;
                }
                else {

                    // if the newElement has no width
                    if (width < 0 || !width) {
                        width = 30;
                    }

                    if (currentElement.id == '858_CDV_3D1T') {
                        newElement = new Segment858(currentElement.id, 5, this.Elements[currentElement.index].coordX, 0);
                    }
                    else if (currentElement.id == '858_CDV_3E1T') {
                        
                        newElement = new Segment858(currentElement.id, currentElement.Track, this.Elements[currentElement.index].coordX, 1);
                    }
                    else {
                        newElement = new Segment(currentElement.id, currentElement.Track, this.Elements[currentElement.index].coordX, width);
                    }

                    startCoordX += width + this.spacer;

                }
                newElement.build();

                this.objSegments[currentElement.id] = newElement;

            }
        }

    }

    this.setSwitchProperties = function (element) {

        // Switchs
        if (element.Name == "CV03C" || element.Name == "SW03T") {
            element.position = "top";
            element.direction = "left";
        }

        if (element.Name == "CV03B") {
            element.position = "top";
            element.direction = "right";
        }

        if (element.Name == "TE01" || element.Name == "TE02" || element.Name == "SW02T" ||
                element.Name == "SW01T" || element.Name == "TE" || element.Name == "TE_TE02T" ||
                element.Name == "TE04" || element.Name == "TE03") {

            element.position = "top";
            element.direction = "right";

            if (element.Track == 1) {
                element.position = "bottom";
            }

            // if is no the first element and the previous element is a DD
            // Turn the element to the left
            if (element.index != 0 && this.Elements[element.index - 1].Name.match("DD")) {
                element.direction = "left";
            }

            // if is not the last element and the next element is a DD
            // Turn the switch to the right
            if (element.index < this.Elements.length - 1 && this.Elements[element.index + 1].Name.match("DD")) {
                element.direction = "right";
            }

        }
    }

    // Built the WT
    this.buildWT = function (segment, startCoordX) {

        // Check if is a WT element
        if (segment.Name.match("WT")) {
            segment.Flag = 0;

            // Find a specific case were will be constructed 
            // different and change the params
            this.findSpecificCase(segment);
            var uni = new UniversalCrossover(segment.id, startCoordX, segment.Track, segment.Flag);
            uni.build();

            this.objSegments[segment.id] = uni;
            return true;
        }

        return false;
    }


    /**			     
     * Function buildSwitch	 
     *			 	  
     * Function to construct Switchs. Each Switch has the same width(42px). 
     * Each type of Switch has a different position (top or bottom) and direction (left or right).
     * In some cases, if the Switch find a DD ,the direction is changed according with DD direction. 
     * @param {Object Segment} Switch is the segment to be built.
     * @param {startCoordX} Position to build the segment.
     * @returns {Boolean} If the Switch was built, returns true.
     */
    this.buildSwitch = function (Segment, startCoordX) {

        var switchBuilded;
        var build = false;

        this.setSwitchProperties(Segment);
        this.findSpecificCase(Segment);

        switchBuilded = new Switch(Segment.id, Segment.Track, startCoordX, Segment.position, Segment.direction);
        switchBuilded.build();
        this.objSegments[Segment.id] = switchBuilded;
        return build;

        return build;
    }


    // Build DD
    this.buildDD = function (DD) {

        var cdv;
        var width = this.widthElements["DD"];
        var position = 0;
        var trackDD = 0;

        var segment = this.findTE(DD);

        // ?? 
        if (segment.Track != 1) {
            trackDD = segment.Track;

            if (segment.Track < DD.Track)
            {
                trackDD += 1;
            }
        }

        // Change position 
        if (segment.direction) {

            // Right direction
            if (segment.direction == "right")
                position += 40 + 5;

            // Left direction
            if (segment.direction == "left")
                position -= 8;
        }

        cdv = new Segment(DD.id, trackDD, segment.coordX + position, width);

        return cdv;
    }

    this.getEndCoordX = function (Track1, Track2, startCoordX) {

        if (mainConfig.positions[Track1.length] > mainConfig.positions[Track2.length])
            return lastposition = mainConfig.positions[Track1.length] + startCoordX;
        else
            return lastposition = mainConfig.positions[Track2.length] + startCoordX;
    }

    this.findTE = function (DD) {

        var numDD = '0' + DD.Name.replace(/[^0-9]/g, '');
        var TE = "TE" + numDD;

        for (var i = 0 ; i < 3 ; i++) {

            if (DD.index + i < Segments.length && Segments[DD.index + i].Name.match(TE)) {
                return this.Elements[DD.index + i];
            }

            if (DD.index - i > 0 && Segments[DD.index - i].Name.match(TE)) {
                return this.Elements[DD.index - i];
            }
        }

        return DD;
    }

    // The rail has some special elements that doesn't have enought 
    // information to build the playback correctly, so we needed to set
    // the correct information somewhere
    // With this method, the attributes are fixed
    this.findSpecificCase = function (Segment) {

     
        var attributes = mainConfig.specificCase[Segment.id];

        if (attributes) {
            if (attributes.direction)
                Segment.direction = attributes.direction;

            if (attributes.track >= 0) {
                Segment.Track = attributes.track;
            }
            if (attributes.position)
                Segment.position = attributes.position;

            if (attributes.flag)
                Segment.Flag = attributes.flag;

            if (attributes.width)
                Segment.Width = attributes.width;

            if (attributes.after) {
                if (this.objSegments[attributes.after] != null)
                    Segment.coordX = this.objSegments[attributes.after].x + this.objSegments[attributes.after].width + this.spacer;
            }

            if (attributes.before)
                Segment.coordX = this.objSegments[attributes.before].x - this.spacer;
        }
    }

    // Calculate the real width of the element
    this.calculateWidth = function (Elements, init, last) {
        var widthtotal = 0,
            switchs = ["TE01", "TE02", "TE04", "TE03", "SW03T", "SW02T", "SW01T", "TE_TE02T", "TE"];
            qtd = 0;

            for (var j = 0; j < Elements.length; j++) {

            if (Elements[j].Width) {
                widthtotal += Elements[j].Width;
            }

            else if (switchs.indexOf(Elements[j].Name) > -1) {
                widthtotal += this.widthElements["Switch"];
                qtd++;
            }

            else if (Elements[j].Name == "WTII") {
                widthtotal += this.widthElements["WT"];
                qtd++;
            }

            else if (Elements[j].Name == "SBA") {
                widthtotal += this.widthElements["SBA"];
                qtd++;
            }

            else if (Elements[j].Name.match("DD")) {
                qtd++;
            }

        }

        return (last - init - widthtotal - (this.spacer * Elements.length)) / (Elements.length - qtd);
    }
}




/**			    
 *			 
 * Function buildDD	 
 *			 	  
 * Function to construct DDs. Each DD has the same width(5px). 
 * It's necessary to calculate if the DD is built before or after a switch.
 * if there's no switch next, the DD is built before.
 * @param {Object Segment} DD is the segment to be built.
 * @returns {Object Segment} with all the correct parameters.
 */


/**			    
 *			 
 * Function calculateWidth	 
 *			 	  
 * Calculate the width to each CDV, the Switch and WTII have always the same width.
 * widthtotal is the amounth from all the WTII and Switchs
 * @param {Array Elements} All the Segments from a specific track to be build.
 * @param {init} Start position to build the elements.
 * @param {last} End position to build the elements.
 * @returns width for all the segments with variable width.
 */


