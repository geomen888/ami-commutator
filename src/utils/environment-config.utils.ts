const env: NodeJS.ProcessEnv = process.env;

export enum Environment {
  dev = 'development',
  stage = 'staging',
  prod = 'production'
}

export class EnvironmentConfigUtils {
  static get(key: string, defaultValue?: any): any {
    return env[key] || defaultValue;
  }

  static boolean(key: string, defaultValue = false): boolean {
    return Boolean(EnvironmentConfigUtils.get(key, defaultValue));
  }

  static number(key: string, defaultValue?: number): number {
    return Number(EnvironmentConfigUtils.get(key, defaultValue));
  }

  static string(key: string, defaultValue?: string): string {
    return String(EnvironmentConfigUtils.get(key, defaultValue));
  }

  static stringLowerCase(key: string, defaultValue?: any): string {
    return EnvironmentConfigUtils.string(key, defaultValue).toLowerCase();
  }

  static isDev(): boolean {
    return EnvironmentConfigUtils.stringLowerCase('NODE_ENV') === 'dev'
      || EnvironmentConfigUtils.stringLowerCase('APP_ENV') === 'development';
  }

  static isStaging(): boolean {
    return EnvironmentConfigUtils.stringLowerCase('NODE_ENV') === 'stage'
      || EnvironmentConfigUtils.stringLowerCase('APP_ENV') === 'staging';
  }

  static isProduction(): boolean {
    return EnvironmentConfigUtils.stringLowerCase('NODE_ENV') === 'prod'
      || EnvironmentConfigUtils.stringLowerCase('APP_ENV') === 'production';
  }

  static getEnvironment(): Environment {
    const isDev = this.isDev();
    if (isDev) {
      return Environment.dev;
    }

    const isStage = this.isStaging();
    if (isStage) {
      return Environment.stage;
    }

    const isProd = this.isProduction();
    if (isProd) {
      return Environment.prod;
    }

    return Environment.dev;
  }
}