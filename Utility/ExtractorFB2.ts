import { BookTemplate } from 'Utility/Book';
import Extractor from '../Utility/Extractor';
import { Notice } from 'obsidian';

export class ExtractorFB2 extends Extractor {

    async readFileContents(file: Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            // first element
            new Notice("Start read FB2");

            reader.onload = (event) => {
                const contents = event.target?.result;
                //console.log(contents);
                const answer = this.getBookContent(contents)

                resolve(answer);
                // third element
                //new Notice("readFileContents2");
            };

            reader.onerror = (event: any) => {
                new Notice("Some error happend with your FB2");
                reject(event.error);
            };

            // general code for read

            reader.readAsText(file);
            // second element
            //new Notice("readFileContents1");
        });
    };

    public getBookContent(content: string | ArrayBuffer | null | undefined): BookTemplate {
        let result = new BookTemplate();
        result.title = "fb2";
        new Notice("Inside getBookContent in FB2" + result.title)

        return result
    }
}

