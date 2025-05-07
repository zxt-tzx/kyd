export function TestPage() {
  return (
    <div className="relative flex w-full justify-center pt-16">
      <div className="w-full max-w-4xl px-4">
        <div className="mx-auto mb-8">
          <div className="card border border-primary/20 bg-card p-6">
            <h1 className="my-4 text-3xl font-bold text-primary">Test Page</h1>
            <p className="my-2 text-foreground">
              This is a test page to demonstrate routing in our application.
            </p>
            <h2 className="my-3 text-2xl font-bold text-primary">Features</h2>
            <ul className="ml-5 list-disc text-foreground">
              <li className="my-1 text-foreground">TanStack Router integration</li>
              <li className="my-1 text-foreground">Component-based architecture</li>
              <li className="my-1 text-foreground">Styled with Tailwind CSS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}