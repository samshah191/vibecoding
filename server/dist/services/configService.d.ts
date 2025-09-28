import { FrameworkOption, ComponentLibraryOption, StateManagementOption, CSSFrameworkOption, RoutingOption } from '../types/app';
export declare class ConfigService {
    static getFrameworkOptions(): FrameworkOption[];
    static getComponentLibraryOptions(): ComponentLibraryOption[];
    static getCSSFrameworkOptions(): CSSFrameworkOption[];
    static getStateManagementOptions(): StateManagementOption[];
    static getRoutingOptions(): RoutingOption[];
    static getCompatibleOptions(framework: string): {
        componentLibraries: ComponentLibraryOption[];
        stateManagement: StateManagementOption[];
        routing: RoutingOption[];
    };
    static getDefaultConfig(framework: string): any;
    static validateConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=configService.d.ts.map