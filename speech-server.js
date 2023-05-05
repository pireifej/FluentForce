const express = require('express');
const multer = require('multer');
var fs = require('fs');
const storage = multer.diskStorage(
    {
	destination: './sound_files/',
	filename: function (req, file, cb ) {
	    cb( null, file.originalname);
	}
    }
);

const upload = multer( { storage: storage } );

const app = express();
const port = 3001;

var ssl = {
    key: fs.readFileSync('/var/www/prayer-api/certs/prayoverus.key', 'utf8'),
    cert: fs.readFileSync('/var/www/prayer-api/certs/795e40f423175e16.crt', 'utf8'),
    ca: [ fs.readFileSync('/var/www/prayer-api/certs/gd_bundle-g2-g1_01.crt', 'utf8'), fs.readFileSync('/var/www/prayer-api/certs/gd_bundle-g2-g1_02.crt', 'utf8'), fs.readFileSync('/var/www/prayer-api/certs/gd_bundle-g2-g1_03.crt', 'utf8') ]
};

app.use(express.static('./'));

app.post("/notes", upload.single("audio_data"), function(req,res){
    res.status(200).send("ok");
});

app.listen(port, () => {
    console.log(`Express server listening on port: ${port}...`);
});
