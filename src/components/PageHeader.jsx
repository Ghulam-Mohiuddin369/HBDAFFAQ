const FLAGS = ['#ff5fa2', '#ffd166', '#5ef0ff', '#b388ff', '#7dffc4', '#ff8a5b', '#ff5fa2', '#ffd166', '#5ef0ff'];

export default function PageHeader({ title, sub }) {
  return (
    <header className="page-head">
      <div className="bunting" aria-hidden="true">
        {FLAGS.map((c, i) => <span key={i} style={{ '--c': c, '--i': i }} />)}
      </div>
      <h1 className="page-title">{title}</h1>
      {sub && <p className="page-sub">{sub}</p>}
    </header>
  );
}
