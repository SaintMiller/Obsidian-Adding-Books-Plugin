import { BookTemplate } from "Book";
import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import * as fs from 'fs';

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
        bookname += " ";
        bookname += data.extension;

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
}