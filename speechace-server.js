#!/usr/local/bin node

var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    cors = require('cors'),
    queryObjectShared = require('./queryObject.js'),
    common = require('./common.js'),
    express = require('express');

var port = 3001;

const pool = queryObjectShared.createPool();

var ssl = {
    key: fs.readFileSync('/var/www/prayer-api/certs/prayoverus.key', 'utf8'),
    cert: fs.readFileSync('/var/www/prayer-api/certs/795e40f423175e16.crt', 'utf8'),
    ca: [ fs.readFileSync('/var/www/prayer-api/certs/gd_bundle-g2-g1_01.crt', 'utf8'), fs.readFileSync('/var/www/prayer-api/certs/gd_bundle-g2-g1_02.crt', 'utf8'), fs.readFileSync('/var/www/prayer-api/certs/gd_bundle-g2-g1_03.crt', 'utf8') ]
};

var app = express();
var fileUpload = require('express-fileupload');
app.use(cors());
app.use(fileUpload());
app.use(express.json()) // parse request body as JSON

var server = https.createServer(ssl, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

app.post('/getSpeechMetrics', (req, res) => {
    var params = req.body;
    const { exec } = require("child_process");

    // https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2939977/
    // https://www.uclass.psychol.ucl.ac.uk/index_new.htm
    // https://www.uclass.psychol.ucl.ac.uk/uclass2.htm
    // https://www.uclass.psychol.ucl.ac.uk/uclassfsf.htm

    const url = "https://api.speechace.co/api/scoring/text/v9/json?";
    const key = "pmtTAUssZ3XsRA3XtvAlSj%2B8wcfoNzJuE68gQ0o4WJNXiJJIaZAo%2FA0dcZcKjNQrsKAh7kMLmFJzrkd3jRC%2F%2FGgjfIg59GDVOsVC%2FinFULLFcZ1XUoZECywDzzCIkUyW";
    const userId = "XYZ-ABC-99001";

    // https://www.uclass.psychol.ucl.ac.uk/Audio/mp3/
    var data = {
//	    "M_1114_09y10m.1.mp3": "The last holiday I had was the summer holiday. I had to go to a course. The course was all about making a video drama. We had to record our voices on audio and.",
	//    "M_0991_08y4m_1.mp3": "And they won the world cup because they have strong players and good attack. When they were versus Germany in the finals, Germany had good defense and good attack.",
	//    "M_0017_09y0m_1.mp3": "for the first holiday we just had a few days at home and then on the first of august 3 o clock in the morning we pile our things into the car strapped them down onto the roof rack and off we went in the direction of pool. we ended up in the pool at about 6 o clock in the morning and two hours later after all the bags have been searched and all the other things",
	//    "M_0095_07y7m_1.mp3": "About these four turtles and they were in their house and then April came and she had stuff for the turtles and she gave all of them their presents then she said she found this it's like this egg timer and it was from Japan and it was like an antique and then she blew it then",
	//    "M_0089_05y4m_1.mp3": "They fight and they did fight the monsters that were in and they kick in their face and they do something they want to do. They want to do something else and after the parachute and they have to go down the parachute and this.",
	//"F_0111_09y6m_1.mp3": "Today, we gain and we",
	//    "F_1039_09y3m_1.mp3": "My teacher's called Mr. Collier and he's very strict. We've got naughty people in my class but he tells them off a lot and we've got this time out corner. You normally go in there for five minutes if you're naughty and sometimes ten. We've got a helper, Mrs Martin because we've got a special needs person in our class. And she helps everybody really. And it's really nice when we get some people coming throughout, we get helpers throughout and we.",
	//    "F_0879_12y5m_1.mp3": "Two best friends are Natalie and Becky. We always go to the pictures. We go ice skating and swimming. We always go together. We watch. We meet each other at play time because we're in the same class. We go to lunch together all the time. I've also go other friends but I don't do as much with them. We got ice skating once for a night or sometimes more as well. We've all got our ice skating boots. My family likes them as well. So they're always around. We've have sleep.",
	//    "F_0560_11y7m_1.mp3": "I like art and everyone says I'm very good at it because I've won many competitions. And I've just joined gymnastics and I once won a medal for that, too. For my SATs, I've got all level fives and I'm going to go to Magna Carta next. I've passed my eleven plus for. I like tea and sports. I'm doing badminton. And I might join karate.",
	//    "F_0811_10y4m_1.mp3": "Drummer and running. I've won eight, no nine, gold medals in running. I've been to five running events. My other hobby is drama. I've done three solos and I've been in a show called Babes in the Wood"
	//	"Ireifej.m4a": "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope."
	"blob.mp3": "And I have one sister. She likes being a doctor and finding out things. And I like doing football. And I want to be a football player when I'm older."
    };

    // special cases:
    // F_0111_09y6m_1.mp3

    for (var audioFileName in data) {
	if (!data[audioFileName]) continue;

	var text = data[audioFileName];
	var cmd = `
curl --location -g "${url}key=${key}&dialect=en-us&user_id=${userId}" --form "text='${text}'" --form "user_audio_file=@/var/www/html/pireifej/speechace/${audioFileName}" --form "include_fluency=1"
`;

	exec(cmd, (error, stdout, stderr) => {
	    var jsonResult = JSON.parse(stdout);
	
	    if (jsonResult.status !== "error") {
		var textScore = jsonResult.text_score;
		console.log(textScore.ielts_score.fluency);
		console.log(textScore.pte_score.fluency);
		console.log(textScore.speechace_score.fluency);
		console.log(textScore.toeic_score.fluency);
		console.log(textScore.cefr_score.fluency);

		var segmentMetricsList = jsonResult.text_score.fluency.segment_metrics_list[0];
		console.log(segmentMetricsList.articulation_length);
		console.log(segmentMetricsList.speech_rate);
		console.log(segmentMetricsList.articulation_rate);
		console.log(segmentMetricsList.syllable_correct_per_minute);
		console.log(segmentMetricsList.all_pause_count);
		console.log(segmentMetricsList.all_pause_duration);

		console.log(segmentMetricsList.ielts_score.fluency);
		console.log(segmentMetricsList.pte_score.fluency);
		console.log(segmentMetricsList.speechace_score.fluency);
		console.log(segmentMetricsList.toeic_score.fluency);
		console.log(segmentMetricsList.cefr_score.fluency);

		res.json(jsonResult);
		return;
	    } else {
		console.log(audioFileName);
		console.log(stdout);
		res.json(stdout);
	    }
	});
    }
});
