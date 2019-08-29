module.exports = {
    port: 8080,                         // Port to host server on
    cors: false,                        // Allow cross-origin requests?
    deleteTimer: 600,                   // Seconds to wait before deleting downloads
    downloadDir: "./downloads",         // Directory to download files
    ffmpegPath: "/usr/bin/ffmpeg" // Path to ffmpeg (must be installed)
}
