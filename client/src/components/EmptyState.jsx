function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center">
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
