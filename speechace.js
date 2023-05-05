var totalInsightScore = 0;

navigator.mediaDevices.getUserMedia({audio:true})
    .then(stream => {handlerFunction(stream)})

function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => {
        audioChunks.push(e.data);
        if (rec.state == "inactive"){
            let blob = new Blob(audioChunks,{type:'audio/mpeg-3'});
            recordedAudio.src = URL.createObjectURL(blob);
            recordedAudio.controls=true;
            recordedAudio.autoplay=true;

            uploadSoundData(blob)
        }
    }
}

function uploadSoundData(blob) {
//    var gFileData = new File([imageResized], img.name, {
//        type: "image/jpg",
//    });

    var formData = new FormData();
    formData.append("fileToUpload", blob);

    $.ajax({
        url: "upload.php",
        dataType: 'script',
        cache: false,
        contentType: false,
        processData: false,
        data: formData,
        type: 'post',
        success: function(response){
            console.log("upload.php success");
            console.log(response);
            var json = JSON.parse(response);
            console.log(json);
	    
            if (json.error == 1) {
                console.log("error:" + json.message);
            }
            if (json.error == 0) {
                console.log("success:" + json.message);
            }
        }
    });
}

function sendData(blob) {

    var fd = new FormData();
    fd.append('fname', 'test.wav');
    fd.append('data', blob);
    console.log(blob.src);
    
    $.ajax({
	type: 'POST',
	url: "https://prayoverus.com:3001/saveAudioFile",
	data: fd,
	processData: false,
	contentType: false
    }).done(function(data) {
	console.log(data);
    });
    return;
    // call ajax
    var port = "3001";
    
    const url = "https://prayoverus.com:" + port + "/saveAudioFile";
	var headers = {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	};

//    const formData = new FormData();
//    formData.append('audio-file', blob);
    //    console.log(formData);

    console.log(blob);
    var options = {
	method : "POST",
	cache: "no-cache",
	headers: headers,
	body: JSON.stringify({"data":blob})
    };
    fetch(url, options)
	.then((response) => {
	    if (!response.ok) {
		console.log("ERROR RESULT");
		throw new Error(response.error)
	    }
	    console.log("SUCCESS RESULT");
	    console.log(response);
	    return response.json();
	})
	.then(data => {
	    console.log("SUCCESS RESULT WITH DATA");
	    console.log(data);
	})
	.catch(function(error) {
	    console.log("FAILED");
	    console.log(error);
	});
}

function displaySpeechMetric(name, value, min, max) {
    // badge-primary - blue
    // badge-info - light-blue
    // badge-warning - yellow
    // badge-danger - red
    $("#" + name).html(value);
    const negativeText = "LOW";
    const positiveText = "HIGH";
    const neutralText = "FINE";

    if (name == "all-pause-count" || name == "all-pause-duration") {
	if (value <= min) {
	    $("#" + name + "-status").addClass("badge-primary");
	    $("#" + name + "-status-text").html(positiveText);
	    totalInsightScore++;
	    return;
	}
	if (value >= max) {
	    $("#" + name + "-status").addClass("badge-danger");
	    $("#" + name + "-status-text").html(negativeText);
	    return;
	}
    } else if (name == "cefr-score-1" || name == "cefr-score-2") {
	if (value == "A1" || value == "A2" || value == "B1" || value == "A2+") {
	    $("#" + name + "-status").addClass("badge-danger");
	    $("#" + name + "-status-text").html(negativeText);
	    return;
	}
	if (value == "C2") {
	    $("#" + name + "-status").addClass("badge-primary");
	    $("#" + name + "-status-text").html(positiveText);
	    totalInsightScore++;
	    return;
	}
    } else {
	if (value >= max) {
	    $("#" + name + "-status").addClass("badge-primary");
	    $("#" + name + "-status-text").html(positiveText);
	    totalInsightScore++;
	    return;
	}
	if (value <= min) {
	    $("#" + name + "-status").addClass("badge-danger");
	    $("#" + name + "-status-text").html(negativeText);
	    return;
	}
    }
    
    $("#" + name + "-status").addClass("badge-info");
    $("#" + name + "-status-text").html(neutralText);
    totalInsightScore++;
}

function getSpeechMetrics() {
    // call ajax
    var port = "3001";
    var params = {
    };
    const url = "https://prayoverus.com:" + port + "/getSpeechMetrics";
	var headers = {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	};
	var options = {
	    method : "POST",
	    cache: "no-cache",
	    headers: headers,
	    body: JSON.stringify(params)
	};
	fetch(url, options)
	    .then((response) => {
		if (!response.ok) {
		    console.log("ERROR RESULT");
		    throw new Error(response.error)
		}
		console.log("SUCCESS RESULT");
		console.log(response);
		return response.json();
	    })
	    .then(data => {
		console.log("SUCCESS RESULT WITH DATA");
		$("#refresh-btn").html("Done");
		
		var textScore = data.text_score;
		console.log(textScore);

		var ieltsScore1 = textScore.ielts_score.fluency;
		displaySpeechMetric("ielts-score-1", ieltsScore1, 5.5, 8.5);

		var pteScore1 = textScore.pte_score.fluency;
		displaySpeechMetric("pte-score-1", pteScore1, 45, 90);
		
		var speechaceScore1 = textScore.speechace_score.fluency;
		displaySpeechMetric("speechace-score-1", speechaceScore1, 63, 95);
		
		var toeicScore1 = textScore.toeic_score.fluency;
		displaySpeechMetric("toeic-score-1", toeicScore1, 110, 190);
		
		var cefrScore1 = textScore.cefr_score.fluency;
		displaySpeechMetric("cefr-score-1", cefrScore1, 0, 0);

		var segmentMetricsList = textScore.fluency.segment_metrics_list[0];
		
		var articulationLength = segmentMetricsList.articulation_length;
		displaySpeechMetric("articulation-length", articulationLength, 3.16, 16);
		
		var speechRate = segmentMetricsList.speech_rate;
		var speechRateRounded = Math.round(speechRate * 100) / 100
		displaySpeechMetric("speech-rate", speechRateRounded, 1.45, 3);
		
		var articulationRate = segmentMetricsList.articulation_rate;
		var articulationRateRounded = Math.round(articulationRate * 100) / 100
		displaySpeechMetric("articulation-rate", speechRateRounded, 1.45, 3);
		
		var syllableCorrectPerMinute = segmentMetricsList.syllable_correct_per_minute;
		var syllableCorrectPerMinuteRounded = Math.round(syllableCorrectPerMinute * 100) / 100
		displaySpeechMetric("syllable-correct-per-min", syllableCorrectPerMinuteRounded, 8, 220);
		
		var allPauseCount = segmentMetricsList.all_pause_count;
		displaySpeechMetric("all-pause-count", allPauseCount, 3, 30);
		
		var allPauseDuration = segmentMetricsList.all_pause_duration;
		displaySpeechMetric("all-pause-duration", allPauseDuration, 1.5, 25);

		var ieltsScore2 = segmentMetricsList.ielts_score.fluency;
		displaySpeechMetric("ielts-score-2", ieltsScore2, 6, 8.5);
		
		var pteScore2 = segmentMetricsList.pte_score.fluency;
		displaySpeechMetric("pte-score-2", pteScore2, 50, 90);
		
		var speechaceScore2 = segmentMetricsList.speechace_score.fluency;
		displaySpeechMetric("speechace-score-2", speechaceScore2, 67, 95);
		
		var toeicScore2 = segmentMetricsList.toeic_score.fluency;
		displaySpeechMetric("toeic-score-2", toeicScore2, 120, 190);
		
		var cefrScore2 = segmentMetricsList.cefr_score.fluency;
		displaySpeechMetric("cefr-score-2", cefrScore2, 0, 0);

		$("#total-insight-score-label").html("calculated just now");
		var totalInsightScoreForever = (totalInsightScore / 16) * 100;
		$("#total-insight-score-heading").html(totalInsightScoreForever + "%");

		// pie chart colors
		// 0 - blue
		// 1 - red
		// 2 - yellow
		// 3 - darkyellow
		// 4 - black
		// 5 - green
		    new Chartist.Pie('#ct-chart9', {
			series: [0, 0, 0, 0, 100-totalInsightScoreForever, totalInsightScoreForever]
    }, {
        donut: true,
        donutWidth: 20,
        donutSolid: true,
        startAngle: 270,
        showLabel: false
    });
	    })
	    .catch(function(error) {
		console.log("FAILED");
		console.log(error);
	    });
}

$("#refresh-btn").click(function() {
    console.log("REFRESH CLICK");
    $("#refresh-btn").html("Loading..");
    getSpeechMetrics();
});

record.onclick = e => {
    console.log('I was clicked')
    record.disabled = true;
    record.style.backgroundColor = "blue"
    stopRecord.disabled=false;
    audioChunks = [];
    rec.start();
}

stopRecord.onclick = e => {
    console.log("I was clicked")
    record.disabled = false;
    stop.disabled=true;
    record.style.backgroundColor = "red"
    rec.stop();
}
