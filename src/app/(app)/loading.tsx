// Between pages: the sidebar stays, the page area shows the mark breathing.
export default function Loading() {
  return (
    <main className="page-loading" role="status" aria-label="Loading">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={72} height={50} />
    </main>
  );
}
