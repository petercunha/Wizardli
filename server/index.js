const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()
const config = require('./config.js')
const YoutubeMp3Downloader = require('./lib/downloader')
const encryption = require("./lib/encryption")

// Enable CORS if config says so
if (config.cors) {
	const cors = require('cors')
	app.use(cors())
}

//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
	ffmpegPath: config.ffmpegPath, // Where is the FFmpeg binary located?
	outputPath: config.downloadDir, // Where should the downloaded and encoded files be stored?
	youtubeVideoQuality: 'highest', // What video quality should be used?
	queueParallelism: 2, // How many parallel downloads/encodes should be started?
	progressTimeout: 2000 // How long should be the interval of the progress reports
})

const STATIC_ASSET_FOLDER = path.join(__dirname, '..', 'website', 'dist', 'youtube-downloader');
app.use('/', express.static(STATIC_ASSET_FOLDER));

app.get('/download/:id', (req, res) => {
	if (!req.params.id) {
		res.status(500).send('No video ID.')
		return
	}

	let sendComplete = false;

	try {
		//Download video and save as MP3 file
		YD.download(req.params.id)

		YD.on('finished', function (err, data) {
			if (err) {
				if (!sendComplete) {
					res.status(500).send('Invalid video ID.')
					sendComplete = true
				}
			} else {
				console.log('Video downloaded:\n', data);

				// Delete file after 
				setTimeout(() => {
					fs.unlink(data.file, (error) => {
						if (error) {
							console.log(`Error deleting ${data.file} ERROR: ${error}`)
						}
					})
				}, config.deleteTimer * 1000);

				var filename = data.file.split('/')
				var downloadId = encryption.encrypt(filename[filename.length - 1])
				if (!sendComplete) {
					res.send(downloadId)
					sendComplete = true
				}
			}
		})

		YD.on('error', function (err) {
			if (!sendComplete) {
				res.status(500).send('Critical error occured during video transcoding.')
				sendComplete = true
			}
			console.log(err)
		})

		YD.on('progress', function (progress) {
			// console.log(JSON.stringify(progress))
		})
	} catch (error) {
		if (!sendComplete) {
			res.status(500).send('An error occurred.')
			sendComplete = true
		}
	}
})

app.get('/downloadFile/:id', (req, res) => {
	try {
		var file = __dirname + '/downloads/' + encryption.decrypt(req.params.id)
		fs.stat(file, function (err) {
			if (err) {
				res.status(500).send('Download failed.')
			} else {
				res.download(file)
			}
		})
	} catch (error) {
		res.status(500).send('Download failed.')
	}
})

app.listen(config.port, () => console.log(`Listening on port ${config.port}`))

// Nodejs encryption with CTR
// var crypto = require('crypto'),
// 	algorithm = 'aes-256-ctr',
// 	password = '~2fD&B,@36$(aAhm';

// function encrypt(text) {
// 	var cipher = crypto.createCipheriv(algorithm, password)
// 	var crypted = cipher.update(text, 'utf8', 'hex')
// 	crypted += cipher.final('hex');
// 	return crypted;
// }

// function decrypt(text) {
// 	var decipher = crypto.createDecipheriv(algorithm, password)
// 	var dec = decipher.update(text, 'hex', 'utf8')
// 	dec += decipher.final('utf8');
// 	return dec;
// }

