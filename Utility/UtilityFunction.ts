
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
}