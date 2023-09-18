export class BookTemplate 
{
    title: string;
    author: string[];
    publisher: string;
    publishDate: string;
    totalPage: string;
    isbn10: string;
    isbn13: string;
    coverUrl: string;
    extension: string;
    hashSize: string;
    status:string;
    tags: string[];
    filePath: string;

    constructor() {
        this.title = '';
        this.author = [];
        this.publisher = '';
        this.publishDate = '';
        this.totalPage = '';
        this.isbn10 = '';
        this.isbn13 = '';
        this.coverUrl = '';
        this.extension = '';
        this.hashSize = '';
        this.status = '';
        this.tags = [];

    }
}