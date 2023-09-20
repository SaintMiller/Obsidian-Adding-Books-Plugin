import { BookTemplate } from "Utility/Book";

export interface MyPluginSettings {
    mySetting: string;
    bookShellFolderPath: string;
    bookNotesFolderPath: string;
    bookNoteTemplatePath: string;
    bookData: BookTemplate;
    
}