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

app.get('/download/:id', (req, res) => {
	if (!req.params.id) {
		res.status(500).send('No video ID.')
		return
	}

	let markedForDeletion = false;
	let sendComplete = false;

	try {
		//Download video and save as MP3 file
		console.log('got:', req.params.id);

		YD.download(req.params.id)

		// Download started
		YD.on('started', function (info) {
			console.log('started:', JSON.stringify(info))
		})

		// Download progress
		YD.on('progress', function (info) {
			console.log(JSON.stringify(info))
		})

		// Download finished
		YD.on('finished', function (err, data) {
			if (err) {
				if (!sendComplete) {
					res.status(500).send('Invalid video ID.')
					sendComplete = true
				}
			} else {
				console.log('Video downloaded:\n', data);

				// Delete file after waiting
				if (!markedForDeletion) {
					markedForDeletion = true;
					setTimeout(() => {
						let fileName = data.file.split('/')[data.file.split('/').length - 1]
						fs.unlink(path.join(__dirname, 'downloads', fileName), (error) => {
							if (error) {
								console.log(`Error deleting ${data.file} ERROR: ${error}`)
							}
						})
					}, config.deleteTimer * 1000);
				}

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
	} catch (error) {
		if (!sendComplete) {
			res.status(500).send('An error occurred.')
			sendComplete = true
		}
	}
})

app.get('/downloadFile/:id', (req, res) => {
	try {
		var file = path.join(__dirname, 'downloads', encryption.decrypt(req.params.id))
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

// Serve UI to all unknown routes
const STATIC_ASSET_FOLDER = path.join(__dirname, '..', 'website', 'dist', 'youtube-downloader');
app.use('*', express.static(STATIC_ASSET_FOLDER));

app.listen(config.port, () => console.log(`Listening on port ${config.port}`))