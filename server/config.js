module.exports = {
    port: 3000,                         // Port to host server on
    cors: true,                        // Allow cross-origin requests?
    deleteTimer: 10,                   // Seconds to wait before deleting downloads
    downloadDir: "./downloads",         // Directory to download files
    ffmpegPath: "/usr/local/bin/ffmpeg" // Path to ffmpeg (must be installed)
}
