import { BookTemplate } from "Book";
import { App, TAbstractFile, TFolder } from "obsidian";

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
}