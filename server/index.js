const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const config = require('./config.js');
const YoutubeMp3Downloader = require('./lib/downloader');
const encryption = require('./lib/encryption');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Enable CORS if config says so
if (config.cors) {
	const cors = require('cors');
	app.use(cors());
}

// Logging middleware
app.use(morgan(':remote-addr [:status] :method :url (:response-time ms)'));

io.on('connection', function(socket) {
	socket.on('joinRoom', roomId => {
		socket.join(roomId);
	});
});

const STATIC_ASSET_FOLDER = path.join(
	__dirname,
	'..',
	'website',
	'dist',
	'youtube-downloader'
);
app.use('/', express.static(STATIC_ASSET_FOLDER));

app.get('/download/:id', (req, res) => {
	if (!req.params.id) {
		res.status(500).send('No video ID.');
		return;
	}

	let markedForDeletion = false;
	let sendComplete = false;

	try {
		// Configure YoutubeMp3Downloader with your settings
		var YD = new YoutubeMp3Downloader({
			ffmpegPath: config.ffmpegPath, // Where is the FFmpeg binary located?
			outputPath: config.downloadDir, // Where should the downloaded and
			// encoded files be stored?
			youtubeVideoQuality: 'highest', // What video quality should be used?
			queueParallelism: 1, // How many parallel downloads/encodes should be started?
			progressTimeout: 150 // How long should be the interval of the progress reports
		});

		YD.download(req.params.id);

		// Download started
		YD.on('started', function(info) {
			io.to(req.query.client).emit('started', {});
		});

		// Download progress
		YD.on('progress', info => {
			io.to(req.query.client).emit('progress', info);
		});

		// Download finished
		YD.on('finished', function(err, data) {
			io.to(req.query.client).emit('finished', {});

			if (err) {
				if (!sendComplete) {
					res.status(500).send('Invalid video ID.');
					sendComplete = true;
				}
			} else {
				console.log('DOWNLOADED:\n', data.videoTitle);

				// Delete file after waiting
				if (!markedForDeletion) {
					markedForDeletion = true;
					setTimeout(() => {
						let fileName = data.file.split('/')[
							data.file.split('/').length - 1
						];
						fs.unlink(path.join(__dirname, 'downloads', fileName), error => {
							if (error) {
								console.log(`Error deleting ${data.file} ERROR: ${error}`);
							}
						});
					}, config.deleteTimer * 1000);
				}

				var filename = data.file.split('/');
				var downloadId = encryption.encrypt(filename[filename.length - 1]);
				if (!sendComplete) {
					res.send(downloadId);
					sendComplete = true;
				}
			}
		});

		YD.on('error', function(err) {
			if (!sendComplete) {
				res
					.status(500)
					.send('Critical error occured during video transcoding.');
				sendComplete = true;
			}
			console.log(err);
		});
	} catch (error) {
		if (!sendComplete) {
			res.status(500).send('An error occurred.');
			sendComplete = true;
		}
	}
});

app.get('/downloadFile/:id', (req, res) => {
	try {
		var file = path.join(
			__dirname,
			'downloads',
			encryption.decrypt(req.params.id)
		);
		fs.stat(file, function(err) {
			if (err) {
				res.status(500).send('Download failed.');
			} else {
				res.download(file);
			}
		});
	} catch (error) {
		res.status(500).send('Download failed.');
	}
});

// Catch all unknown routes, serve UI
app.all('/*', function(req, res, next) {
	res.sendFile('index.html', { root: STATIC_ASSET_FOLDER });
});

server.listen(config.port, () =>
	console.log(`Started at http://localhost:${config.port}`)
);
