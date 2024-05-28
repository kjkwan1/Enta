import { MachineConfig } from "@/interface/MachineConfig";
import { Platform } from "react-native";

export default class ConfigurationService {
    private static instance: ConfigurationService;
    private static config: MachineConfig = {
        platform: Platform.OS
    }

    public static getInstance() {
        if (ConfigurationService.instance == null) {
            ConfigurationService.instance = new ConfigurationService();
        }

        return this.instance;
    }

    public static isMobile() {
        return ConfigurationService.config.platform !== 'web';
    }

    public get(key: keyof MachineConfig) {
        return ConfigurationService.config[key];
    }
}