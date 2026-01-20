export default function StandardPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // This is a parallel route stub: should be usable as a drawer from /startup/:id
  return (
    <div>
      <h2>Standard {id}</h2>
      <p>Detail & history placeholder</p>
    </div>
  );
}
