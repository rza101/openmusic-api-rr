/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const { nanoid } = require('nanoid');

class StorageService {
    constructor(folderPath) {
        this._folderPath = folderPath;

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    writeFile(file, metadata) {
        const filename = `${+new Date()}_${nanoid(10)}_${metadata.filename}`;
        const path = `${this._folderPath}/${filename}`;

        const fileStream = fs.createWriteStream(path);

        return new Promise((resolve, reject) => {
            fileStream.on('error', (error) => reject(error));
            file.pipe(fileStream);
            file.on('end', () => resolve(filename));
        });
    }
}

module.exports = StorageService;
