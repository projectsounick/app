declare module "react-test-renderer";

declare const it: (name: string, fn: () => void) => void;
declare const expect: (value: unknown) => {
  toMatchSnapshot: () => void;
};
