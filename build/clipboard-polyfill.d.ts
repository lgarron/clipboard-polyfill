import { DT } from "./DT";
declare global {
    interface Navigator {
        clipboard: {
            writeText?: (s: string) => Promise<void>;
            readText?: () => Promise<string>;
        };
    }
}
export { DT };
export declare function setDebugLog(f: (s: string) => void): void;
export declare function suppressWarnings(): void;
export declare function write(data: DT): Promise<void>;
export declare function writeText(s: string): Promise<void>;
export declare function read(): Promise<DT>;
export declare function readText(): Promise<string>;
