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
export default class ClipboardPolyfillDefault {
    static readonly DT: typeof DT;
    static setDebugLog(f: (s: string) => void): void;
    static suppressWarnings(): void;
    static write(data: DT): Promise<void>;
    static writeText(s: string): Promise<void>;
    static read(): Promise<DT>;
    static readText(): Promise<string>;
}
