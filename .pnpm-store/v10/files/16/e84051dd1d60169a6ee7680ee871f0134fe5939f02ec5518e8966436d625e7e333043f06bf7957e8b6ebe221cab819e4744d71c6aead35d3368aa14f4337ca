import { Logger } from 'named-logs';
export type CLogger = Logger & {
    namespace: string;
    decoration?: string;
    level: number | undefined;
    traceLevel: number | undefined;
    enabled: boolean;
};
type LoggerValues = {
    enabled?: boolean | undefined;
    level?: number | undefined;
    traceLevel?: number | undefined;
};
export declare const factory: {
    (namespace: string, options?: {
        decoration?: string;
    }): CLogger;
    level: number;
    traceLevel: number;
    labelVisible: boolean | string;
    setTraceLevelFor: (namespace: string, newLevel: number) => void;
    disable: () => void;
    enable: (namespaces?: string) => void;
};
export declare function replaceConsole(namespace?: string): Console;
export declare function hookup(): void;
export declare function setupLogger(namespace: string | string[], values: LoggerValues): void;
export {};
//# sourceMappingURL=index.d.ts.map