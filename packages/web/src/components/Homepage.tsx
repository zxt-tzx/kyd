import { DevSearchInput } from "./home/DevSearchInput";

export function Homepage() {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-xl px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Know Your Dev
        </h1>
        <div className="mx-auto mb-8 max-w-md">
          <DevSearchInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
          />
        </div>
      </div>
    </div>
  );
}
