const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const mkdir = require('make-dir');
const beautify = require('js-beautify');
const {
    link
} = require('./config.json');

(async () => {
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    let start = Date.now();
    let _playlist = await ytpl(link);

    try {
        let path = await mkdir(`./${_playlist.title}`);
        console.log(`[MAKE_DIR] ${((Date.now() - start) / 1000)}s | ${path}\n\n`);
    } catch (error) {
        path = await mkdir(`./${playlist.id}`);
        console.log(`[MAKE_DIR] ${((Date.now() - start) / 1000)}s | ${path}\n\n`);
        console.log(`[MAKE_DIR] ${((Date.now() - start) / 1000)}s | \n${error}\n\n`);
    };

    let playlist = JSON.stringify(_playlist)
    playlist = beautify(playlist)
    fs.writeFileSync(`./${_playlist.title}/data.json`, playlist);
    console.log(`[YTPL] ${((Date.now() - start) / 1000)}s | Playlist Data Ready\n\n`);

    let pl = _playlist
    const _ = require(`./${_playlist.title}/data.json`)
    for (let i = 0; i < _.estimatedItemCount; i++) {
        const $ = _.items[i]
        const stream = ytdl(pl.items[i].id, {
            filter: 'audioonly',
            quality: 'highestaudio'
        })

        const regex = /[\\/:"*?<>|]+/
        let title = pl.items[i].title
        if (title.match(regex)) title = title.replace(regex, "")

        ffmpeg(stream)
            .audioBitrate(128)
            .save(`./${_playlist.title}/${title}.mp3`)
            .on('start', async cl => {
                console.log(`[FFMPEG] ${((Date.now() - start) / 1000)}s | Spawned ${i} | ${cl}`)
            })
            .on('end', () => {
                console.log(`[FFMPEG] ${((Date.now() - start) / 1000)}s | ${i} | Downloaded Title - ${$.title}, ID - ${$.id}, Channel - ${$.author.name}\n\n\n`);
            })
        await sleep(60000)
    };
})();