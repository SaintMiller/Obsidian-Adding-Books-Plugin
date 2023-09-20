import { BookTemplate } from "Book";
import { App, FileSystemAdapter, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { MyPluginSettings } from "./MyPluginSettings";

//Save all small function here and use them!
export namespace Utility {
    export function getFileExtension(filePath: string) {
        const lastIndex = filePath.lastIndexOf('.');
        if (lastIndex !== -1) {
            return filePath.slice(lastIndex + 1);
        } else {
            return '';
        }
    }

    export function calcDigitInString(inputString:string): number{
        let digitCount = 0;
        for (let i = 0; i < inputString.length; i++) {
            const character = inputString.charAt(i);
            if (/\d/.test(character)) {
                digitCount++;
            }
        }

        return digitCount;
    }

    export function prepareFilename(data:BookTemplate): string {
        let bookname: string = "";
        bookname += data.author.join(' ');
        bookname += " ";
        bookname += data.title;
        // bookname += " ";
        // bookname += data.extension;

        data.filename = bookname;

        return bookname;
    }

    export function getFolders(app: App, inputStr: string): TFolder[] {
        const abstractFiles = app.vault.getAllLoadedFiles()
        const lowerCaseInputStr = inputStr.toLowerCase()

        return abstractFiles.filter(
            (folder: TAbstractFile) =>
                folder instanceof TFolder &&
                folder.path.toLowerCase().contains(lowerCaseInputStr) &&
                !folder.path.slice(lowerCaseInputStr.length).includes("/")
        ) as TFolder[];
    }

    export function getFilesInFolder(app: App, folderPath: string): TFile[] {
        const allFiles = app.vault.getFiles();
        if (folderPath.length === 0) {
            return allFiles.filter((file: TFile) =>
                file.parent?.path == app.vault.getRoot().path
            );
        } else {
            return allFiles.filter((file: TFile) =>
                file.path.startsWith(folderPath)
            );
        }
    }

    export function getFoldersAndFilesInFolder(app: App, inputStr: string): string[]  
    {
        const folders = getFolders(app, inputStr);
        let res = folders.map((folder) => folder.path);

        const files = getFilesInFolder(app, inputStr);
        const filePath = files.map(file => file.path)
        res = res.concat(filePath);

        return res;
    }

    export function doesDirectoryExist(directoryPath: string): boolean {
        try {
            return fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory();
        } catch (err) {
            return false; 
        }
    }

    export function isObsidianFilePath(filePath:string): boolean {
        const allFiles = app.vault.getFiles();
        const filter = allFiles.filter((file: TFile) =>
            file.path == filePath
        );

        return filter.length >= 1;
    }

    export async function copyTemplateFileWithReplacements(
        app: App,
        templateFilePath: string,
        targetFolderPath: string,
        bookData: BookTemplate
    ): Promise<boolean>  {
        const fileAdapter = app.vault.adapter as FileSystemAdapter;
        const coolTime = getCurrentTime();

        try {
            const sourceContent = await fileAdapter.read(templateFilePath);
            let modifiedContent = sourceContent;
            for (const key in bookData) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                // @ts-ignore
                let value = bookData[key]

                let replacement = '';
                if (Array.isArray(value) && value.length > 0) {
                    replacement = value.join(', ');
                } else if (typeof value === 'string') {
                    replacement = value;
                } else {
                    replacement = '';
                }
                
                modifiedContent = modifiedContent.replace(regex, replacement);
            }

            // I know it's a mistake, but it works for me. sorry(2)
            modifiedContent = modifiedContent.replace(/\{\{DATE:YYYY-MM-DD HH:mm:ss\}\}/g, coolTime[1]);

            const sourceFileName = prepareFilename(bookData);
            const targetPath = `${targetFolderPath}/${coolTime[0]} ${sourceFileName}.md`;

            await fileAdapter.write(targetPath, modifiedContent);
            
            return true;
        } catch (error) {
            console.error(`Error for copy template\nand create note:\n${error}`);
            return false;
        }
    }

    export function getCurrentTime(): string[] {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');

        const formattedDate1 = `${year}-${month}-${day}-${hours}-${minutes}`;
        const formattedDate2 = `${year}-${month}-${day} ${hours}:${minutes}`;

        return [formattedDate1, formattedDate2];
    }

    export function recreateBookFile(mps: MyPluginSettings): boolean {
        const fileName = prepareFilename(mps.bookData);
        if (fileName.length <= 1) {
            new Notice(`File ${mps.bookData.filePath}\n NOT COPIED!`)

            return false;
        }

        const newFileName = `${fileName}.${mps.bookData.extension}`
        const destinationFilePath = path.join(mps.bookShellFolderPath, newFileName);

        fs.copyFileSync(mps.bookData.filePath, destinationFilePath);

        //fs.unlinkSync(sourceFilePath); // delete orig file

        return true;
    }

    export function calculateFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const hash = crypto.createHash(algorithm);
            const stream = fs.createReadStream(filePath);

            stream.on('data', (data) => {
                hash.update(data);
            });

            stream.on('end', () => {
                const fileHash = hash.digest('hex');
                resolve(fileHash);
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });
    }


    export async function checkBookNotesByTag(app: App, settings: MyPluginSettings): Promise<boolean> {
        let isUniq = true;
        const allFiles = app.vault.getFiles();
        const filtered = allFiles.filter((file: TFile) =>
            file.path.startsWith(settings.bookNotesFolderPath)
        );
        
        const hash = settings.bookData.fileHash256;

        const promises = filtered.map(async (file) => {
            const tag = await getHashTagValue(app, file);
            if ((tag != null) && (tag.includes(hash) || hash.includes(tag))) {
                isUniq = false;
            }
        });

        await Promise.all(promises);

        return isUniq;
    }

    async function getHashTagValue(app: App, file: TFile): Promise<string | null> {
        try {
            const fileContent = await app.vault.read(file);

            const sizeTagRegex = /fileHash:\s*(\S+)/i;
            const match = sizeTagRegex.exec(fileContent);

            if (match && match.length >= 1) {
                return match[0];
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
}