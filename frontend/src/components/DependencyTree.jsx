export default function DependencyTree({ html }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">Dependency Parse Tree</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          Syntactic Analysis &nbsp;·&nbsp; First 3 sentences
        </span>
      </div>

      {!html ? (
        <p className="text-sm text-slate-400">No parse tree available.</p>
      ) : (
        <>
          <div
            className="dep-tree overflow-x-auto bg-slate-50 rounded-xl p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <p className="text-xs text-slate-400 mt-3">
            Arrows point from <span className="font-medium">head</span> to{' '}
            <span className="font-medium">dependent</span>. Labels show grammatical relations
            (nsubj, dobj, amod, …).
          </p>
        </>
      )}
    </div>
  )
}
