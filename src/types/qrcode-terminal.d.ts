declare module "qrcode-terminal" {
  export interface GenerateOptions {
    readonly small?: boolean;
  }

  export function generate(value: string, options?: GenerateOptions): void;

  const qrcode: {
    readonly generate: typeof generate;
  };

  export default qrcode;
}
