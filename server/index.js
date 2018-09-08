const fs = require('fs')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const YoutubeMp3Downloader = require('./lib/downloader')

//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
	ffmpegPath: '/usr/local/bin/ffmpeg', // Where is the FFmpeg binary located?
	outputPath: './downloads', // Where should the downloaded and encoded files be stored?
	youtubeVideoQuality: 'highest', // What video quality should be used?
	queueParallelism: 2, // How many parallel downloads/encodes should be started?
	progressTimeout: 2000 // How long should be the interval of the progress reports
})

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
				var filename = data.file.split('/')
				var downloadId = encrypt(filename[filename.length - 1])
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
			console.log(JSON.stringify(progress))
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
		var file = __dirname + '/downloads/' + decrypt(req.params.id)
		fs.stat(file, function (err) {
			if (err) {
				res.status(500).send('Download failed.')
			} else {
				res.download(file)

				// Delete file after 15 minutes
				setTimeout(() => {
					fs.unlink(file, (error) => {
						if (error) {
							console.log(`Error deleting ${file} ERROR: ${error}`)
						}
					})
				}, 15 * 60000);
			}
		})
	} catch (error) {
		res.status(500).send('Download failed.')
	}
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

// Nodejs encryption with CTR
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = '~2fD&B,@36$(aAhm';

function encrypt(text) {
	var cipher = crypto.createCipher(algorithm, password)
	var crypted = cipher.update(text, 'utf8', 'hex')
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text) {
	var decipher = crypto.createDecipher(algorithm, password)
	var dec = decipher.update(text, 'hex', 'utf8')
	dec += decipher.final('utf8');
	return dec;
}