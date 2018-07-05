
var _hours = $("#hours");
var _minutes = $("#min");
var _seconds = $("#sec");
var _date = $("#date")

var _btnIniciarSimulacao = $("#btnIniciarSimulacao");
var _btnPausarSimulacao = $("#btnPausarSimulacao");
var _btnGerarSegmentos = $("#btnGerarSegmentos");
var _btnAvancarSimulacao = $("#btnAvancarSimulacao");

var _lbtime = $("#time");

var trackBuilder = new TrackBuilder();
var movements = new CreateMovements();
var Movements = {};

var clock;

var add = 0;

var velocity_clock = 1;
var velocity_train = 1;
var paused = false;
var finished = false;
var objSegments = {};
var objDDs = {};
var locations;
var indications = {};
var idIntervalClock;
var idIntervalTrain;
var dateFim;

/* Main Function */
$(function () {
    

    _btnGerarSegmentos.click(function () {
        gerarSegmentos();
    });

    _btnIniciarSimulacao.click(function () {

        if (!paused){
            getMovimentsTrains();
        }
        else
            paused = false;
    });

    _btnPausarSimulacao.click(function () {
        paused = true;
    });

})

function getMovimentsTrains() {

    var km = $('[id*="txt"]').val();

    var dataInicio = $('[id*="txtData"]').val();
    var dataFim = $('[id*="txtDataFim"]').val();


    if ((km == "" || km == null) ||
        (dataInicio == "" || dataInicio == null) ||
        (dataFim == "" || dataFim == null)) {
        showMessage("Verifique os campos de locação e as datas!");
        return false;
    }


    var parts = dataInicio.split('/');
    var time = parts[2].split(" ")[1];
    
    clock = new Date(Date.parse(dataInicio));
    clock.setMonth(parts[1]-1);
    clock.setDate(parts[0]);
    clock.setHours(time.split(":")[1][0])
    clock.setMinutes(time.split(":")[1]);
    

    parts = dataFim.split('/');
    time = parts[2].split(" ")[1];

    dateFim = new Date(Date.parse(dataFim));
    dateFim.setMonth(parts[1]-1);
    dateFim.setDate(parts[0]);
    clock.setHours(time.split(":")[1][0]);
    dateFim.setMinutes(time.split(":")[1]);


    $.ajax({

        url: "Ws/PlaybackWs.asmx/getMovments",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{km:'" + km + "',dataInit:'" + dataInicio + "',dataEnd:'" + dataFim + "'}",
        dataType: "json",
        success: function (data) {
            Movements = data.d;
            getIndications(dataInicio, dataFim, km,Movements);
        },
        error: function (xhr, status, error) {
            console.log("erro: " + xhr.responseText);
        }
    });

    return false;
}

function gerarDDs(Km) {
    $.ajax({
        url: "Ws/PlaybackWs.asmx/getListDD",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{location:'" + Km + "'}",
        dataType: "json",
        success: function (data) {
            var DDs = data.d;
            objSegments = trackBuilder.createKMs(Segments, 2, 2);
            objDDs = trackBuilder.createDDs(DDs);
        },
        error: function (xhr, status, error) {
            console.log("error: " + xhr.responseText);
        }
    });

}

function gerarSegmentos() {

    var Km = $('[id*="txtKM"]').val();

    trackBuilder.clean();

    $.ajax({
        url: "Ws/PlaybackWs.asmx/getListSegment",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{location:'" + Km + "'}",
        dataType: "json",
        success: function (data) {
            Segments = data.d;
            gerarDDs(Km);
        },
        error: function (xhr, status, error) {
            console.log("error: " + xhr.responseText);
        }
    });

    return false;
}

function getIndications(dataInicio, dataFim, km, Movements) {

    $.ajax({
        url: "Ws/PlaybackWs.asmx/GetIndications",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{km:'" + km + "',dataInit:'" + dataInicio + "',dataEnd:'" + dataFim + "'}",
        dataType: "json",
        Async:true,
        success: function (data) {
            indications = JSON.parse(data.d);

            movements.start(Movements, objSegments, indications, objDDs);

            idIntervalClock = setInterval(setClock, 1000);
            idIntervalTrain = setInterval(setTrains, 100);
        },
        error: function (xhr, status, error) {
            console.log("error: " + xhr.responseText);
            return false;
        }
    });

}

function setTrains() {
    if (!paused)
        movements.simulateMovements();
}

function setClock() {
    if (!paused) {
        clock.setSeconds(clock.getSeconds() + add);
        var datetxt = clock.getMonth() + 1;
        _date.text((clock.getDate() < 10 ? "0" : "") + clock.getDate() + "/" + (datetxt < 10 ? "0" : "") + datetxt + "/" + (clock.getFullYear() < 10 ? "0" : "") + clock.getFullYear());
        _hours.text((clock.getHours() < 10 ? "0" : "") + clock.getHours());
        _minutes.text((clock.getMinutes() < 10 ? "0" : "") + clock.getMinutes());
        _seconds.text((clock.getSeconds() < 10 ? "0" : "") + clock.getSeconds());
        add = 60;

        // alert(clock + dateFim);
        //console.log(clock + dateFim);
        if (clock >= dateFim) {
            alert("Terminou");
            finished = true;
            clearInterval(idIntervalClock);
            clearInterval(idIntervalTrain);
        }
    }
}
