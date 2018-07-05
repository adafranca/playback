/*=============================================
=            Playback CreateMovements          =
=============================================*/
/**
 *
 */

/**
 * CreateMovements  Class ---
 * 
 */

function CreateMovements() {

    this.movements = [];

    this.objSegments = {};
    this.objDDs = {};

    this.indications = {};

    this.routes = {};

    this.trains = {};

    this.posInd = 0;

    this.zonaTexto = $("#zonaTexto");

    this.start = function (movements, objSegment, indications, objDD) {
        this.movements = movements;
        this.objSegments = objSegment;
        this.indications = indications;
        this.objDDs = objDD;
    }

    this.setMovement = function (objsegment, data) {

        var objtrain = {};

        var train = data['train'];
        var location = data['location'];
        var element = data['element'];
        var track = data['track'];
        var direction = data['direction'];

        if (objsegment != null) {

            if (element != 'WT')
                track = objsegment.track[0];


            // * Train was not created 
            if (train != "null" && this.trains[train] == null) {
                objtrain = new Train(train, track, objsegment.x, 30);
                objtrain.build();

                var x = objsegment.x + 30;
                objtrain.changePosition(x, direction, track);

                objtrain.segment = location + "_" + element;

                this.trains[train] = objtrain;
                this.objSegments[location + "_" + element].train = train;

            }
                // When the train is 'null', the segment will vacate a segment
            else if (train == "null") { // without train

                // The element has the train name 
                train = objsegment.train;

                if (train != null) {

                    // Get the objtrain
                    objtrain = this.trains[train];
                    // vacate the segment 
                    objSegments[location + "_" + element].train = null;

                    // Check if it's the current position of the train. If true, the train will be destroyed.
                    if (location + "_" + element == objtrain.segment) {
                        alert("tREM DESTRUIDO" + objsegment.train);
                        this.trains[train].destroy();

                        this.trains[train] = null;
                    }

                }

            }
            else {
                objtrain = this.trains[train];
                var x = objtrain.x;

                    
                // When the train still in the same segment 
                if (objtrain.segment == location + "_" + element) {
                    this.trains[train].changePosition(x + 15 * objtrain.direction, objtrain.direction, track);
                }
                    // When it's a new segment, check if it not train in this segment
                else if (objsegment.train == null) {
                    var x = objsegment.x + 30;
                    this.trains[train].changePosition(x, objtrain.direction, track);
                    this.trains[train].segment = location + "_" + element;
                    this.objSegments[location + "_" + element].train = train;


                }
            }


        }

    }

    this.setStatus = function (objsegment, data){

        var description = data['description'];
        var flag = data['flag'];

        if (objsegment != null) {

            if (description == "SpeedCodeEn")
                flag = (flag == 1 ? 0 : 1);

            if (flag == '1') {
                objsegment.addState(description);
            }
            else {
                objsegment.deleteState(description);
            }

        }

    }

    this.setRoute = function (data) {

        var location = data['location'];
        var element = data['element'];
        var flag = data['flag'];
        var status = data['description'];
        var description = "";

        if (flag == 1) {

            var route = this.routes[location + "_" + element];

            // verify if exists and just change Status
            if (route) {
                this.routes[location + "_" + element].changeStatus(status);
            }
            // Else create a new route
            else {

                //element.split("_")[1]
                var route = new Route(location, element, status);

                route.build(this.objSegments);

                this.routes[location + "_" + element] = route;
            }

        }
        else {

            var route = this.routes[location + "_" + element];

            if (route) {
                if(route.destroy(status))
                    this.routes[location + "_" + element] = null;
            }
        }

    }

    this.simulateMovements = function () {

        for (var i = this.posInd; i < this.indications.length; i++) {

            var type = this.indications[i]['type'];

            var hours = (type == "Event" ? this.indications[i]["date_created"].slice(0, 2) : this.indications[i]["date_updated"].slice(0, 2));
            var minutes = (type == "Event" ? this.indications[i]['date_created'].slice(2, 4) : this.indications[i]['date_updated'].slice(2, 4));
            var date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);

            if (clock.getMinutes() < date.getMinutes() || clock.getHours() < date.getHours()) {
                break;
            }

            if (clock.getMinutes() >= date.getMinutes() && clock.getHours() >= date.getHours()) {

                var data = {
                    'location': this.indications[i]['location'], 'element': this.indications[i]['element'], 'description': this.indications[i]['description'],
                    'flag': this.indications[i]['flag'], 'train': this.indications[i]['train'], 'direction': this.indications[i]['direction'],
                    'track': this.indications[i]['track'], 'st': this.indications[i]['st']
                }

                if (data['element'] === 'SWSLZ03') data['element'] = 'CV03B';
                if (data['element'] === 'SLZ02') data['element'] = 'CV02B';
                if (data['element'] === 'SWCAR03') data['element'] = 'CV03C';
                if (data['element'] === 'CAR02') data['element'] = 'CV02C';

                var objsegment = objSegments[data['location'] + "_" + data['element']];

                switch (data['description']) {
                    
                    case 'ept.dl.Component':
                        this.setMovement(objsegment, data);
                        break;
                    case 'Grant':
                        this.setRoute(data);
                        break;
                    case 'Register':
                        this.setRoute(data);
                        break;
                    case 'TimeLock':
                        this.setRoute(data);
                        break;
                    case 'Active':
                        this.setStateDD(data);
                        break;
                    case 'Inhibit':
                        this.setStateDD(data);
                        break;
                    default:
                        this.setStatus(objsegment, data);
                        break;

                }

                this.createLog(i);
                this.posInd = i + 1;

            }

        }

    }

    this.createLog = function (i) {

        var location = this.indications[i]['location'];
        var element = this.indications[i]['element'];
        var description = this.indications[i]['description'];
        var flag = this.indications[i]['flag'];
        var train = this.indications[i]['train'];
        var direction = this.indications[i]['direction'];
        var track = this.indications[i]['track'];
        var type = this.indications[i]['type'];


        var date = (clock.getDate() < 10 ? "0" : "") + clock.getDate() + "/" + (clock.getMonth() + 1 < 10 ? "0" : "") + clock.getMonth() + "/" + (clock.getFullYear() < 10 ? "0" : "") + clock.getFullYear() + " " + (clock.getHours() < 10 ? "0" : "") + clock.getHours() + ":" + (clock.getMinutes() < 10 ? "0" : "") + clock.getMinutes()
        if (type == "status") {
            $('.divNormal').eq(0).removeClass("divRoutes");
            this.zonaTexto.prepend("<div class='divNormal divRoutes'><p><b>" + date + "</b>: Indication: " + description + " Track: " + track + " Segmento: " + element + " Flag: " + (flag == 0 ? "desativar" : "ativar") + "</p></div>");
        }
        else if (train != 'null') {
            $('.divNormal').eq(0).removeClass("divRoutes");
            this.zonaTexto.prepend("<div class='divNormal divRoutes'><p><b>" + date + "</b>: Train: " + train + " Track: " + track + " Segmento: " + element + " Direção: " + (direction == 1 ? 'Carajás' : 'Norte-Sul') + "</p></div>");
        }
            

    }

    this.setStateDD = function (data) {

        var flag = data["flag"];
        var element = data["element"];
        var location = data["location"];
        var status = data["description"]

        var objDD = null;
        objDD = this.objDDs["KM" + location + "." + element];

        if(objDD != null){
            if (flag == 0)
                objDD.deleteState(status);
            if (flag == 1)
                objDD.addState(status);
        }

    }

    this.deleteState = function (movement, state) {
        if (movement.Ud.match("WT"))
            state = state + movement.Track;

        objSegments[movement.Location + "_" + movement.Ud].deleteState(state);
    }

    this.addState = function (movement, state) {

        // DD
        
        if (movement.Ud.match("WT"))
            state = state + movement.Track;

        objSegments[movement.Location + "_" + movement.Ud].addState(state);
    }

}

/* DEBUG 
if (objSegments[nextmovement.Location + "_" + nextmovement.Ud] == null)
    alert(nextmovement.Location + "_" + nextmovement.Ud); */