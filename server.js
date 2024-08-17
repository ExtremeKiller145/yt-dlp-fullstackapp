const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const ejs = require('ejs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

function downloadAndDeleteFile(res, filePath, uuid) {
    res.download(filePath, `${uuid}.txt`, (err) => {
        if (err) {
            console.error(`Error downloading file: ${err}`);
            return res.status(500).send('Error downloading file');
        }

        // Delete the file after download completes
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            } else {
                console.log(`File ${filePath} deleted successfully`);
            }
        });
    });
}

const audioFormats = ['mp3','ogg','wav','aac','m4a'];
const videoFormats = ['mp4','flv'];
function getFormatType(format = ''){
    let f = null;
    audioFormats.forEach(str => {
        if (str == format){
            f = 'audio';
            return;
        }
    });
    videoFormats.forEach(str => {
        if (str == format){
            f = 'video';
            return;
        }
    });
    return f
}

app.post('/submit', (req, res) => {
    const url = req.body.url;
    const fileFormat = req.body.format;

    console.log(`URL submitted was: ${url}`);

    const uuid = crypto.randomUUID();
    console.log(`uuid created is ${uuid}`);

    try {
        const formatType = getFormatType(fileFormat);
        if (formatType == 'audio') {
            execSync(`./youtube-to-audio.sh ${uuid} ${url} ${fileFormat}`, { stdio: 'inherit' });
        } else if (formatType == 'video'){
            execSync(`./youtube-to-video.sh ${uuid} ${url} ${fileFormat}`, { stdio: 'inherit' });
        } else {
            console.log('Invalid file format provided');
            return res.status(400).render('error', { errorMessage: 'Format selected is incompatible' });
        }

        const filePath = path.join(__dirname, 'storage', `${uuid}.${fileFormat}`);

        if (fs.existsSync(filePath)) {
            const file_extension = path.extname(filePath);
            if (file_extension !== `.${fileFormat}`) {
                console.log(`File ${filePath} is not .${fileFormat}`);
                return res.status(400).render('error', { errorMessage: `Generated file is not a .${fileFormat} file` });
            }
            downloadAndDeleteFile(res, filePath, uuid);
        } else {
            res.status(404).render('error', { errorMessage: 'File not found' });
        }
    } catch (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).render('error', { errorMessage: `Error generating file. Was your URL correct? You gave: ${url}` });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});