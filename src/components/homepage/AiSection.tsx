import { ScrollFadeIn } from './ScrollFadeIn'

const AI_FEATURES = [
  {
    title: 'Auto-Tag',
    description: 'Suggest relevant tags based on item content',
  },
  {
    title: 'AI Summary',
    description: 'Generate concise summaries for long items',
  },
  {
    title: 'Explain Code',
    description: 'Plain-language explanations for any snippet',
  },
  {
    title: 'Prompt Optimizer',
    description: 'Rewrite and improve your AI prompts',
  },
]

export function AiSection() {
  return (
    <section id="ai" className="py-[100px]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <ScrollFadeIn>
          <span className="inline-block px-3 py-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wide mb-4">
            Pro Feature
          </span>
          <h2 className="text-[clamp(22px,3.5vw,32px)] font-bold tracking-[-0.02em] mb-3">
            AI-powered knowledge management
          </h2>
          <p className="text-zinc-400 mb-7">Let AI do the heavy lifting so you can focus on building.</p>

          <ul className="flex flex-col gap-4">
            {AI_FEATURES.map(f => (
              <li key={f.title} className="flex items-start gap-3.5">
                <span className="w-[22px] h-[22px] rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-px">
                  ✓
                </span>
                <div>
                  <strong className="block text-sm font-semibold mb-0.5">{f.title}</strong>
                  <span className="text-[13px] text-zinc-400">{f.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="bg-[#1e1e2e] border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs">
            {/* Editor header */}
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#181825] border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-auto text-[10px] text-zinc-600 tracking-wide">typescript</span>
            </div>

            {/* Editor body */}
            <div className="px-5 py-4 leading-[1.7] text-[#cdd6f4] whitespace-pre">
              <div><span className="text-[#cba6f7]">function</span> <span className="text-[#89b4fa]">useDebounce</span><span className="text-[#89dceb]">&lt;</span><span className="text-[#f38ba8]">T</span><span className="text-[#89dceb]">&gt;</span><span className="text-[#cdd6f4]">(</span></div>
              <div className="pl-4"><span className="text-[#a6e3a1]">value</span><span className="text-[#cdd6f4]">:</span> <span className="text-[#f38ba8]">T</span><span className="text-[#cdd6f4]">,</span></div>
              <div className="pl-4"><span className="text-[#a6e3a1]">delay</span><span className="text-[#cdd6f4]">:</span> <span className="text-[#f38ba8]">number</span></div>
              <div><span className="text-[#cdd6f4]">):</span> <span className="text-[#f38ba8]">T</span> <span className="text-[#cdd6f4]">{'{'}</span></div>
              <div className="pl-4"><span className="text-[#cba6f7]">const</span> <span className="text-[#a6e3a1]">[debouncedValue, setDebouncedValue]</span></div>
              <div className="pl-8"><span className="text-[#89dceb]">=</span> <span className="text-[#89b4fa]">useState</span><span className="text-[#89dceb]">&lt;</span><span className="text-[#f38ba8]">T</span><span className="text-[#89dceb]">&gt;</span><span className="text-[#cdd6f4]">(</span><span className="text-[#a6e3a1]">value</span><span className="text-[#cdd6f4]">)</span></div>
              <div className="h-[0.85em]" />
              <div className="pl-4"><span className="text-[#89b4fa]">useEffect</span><span className="text-[#cdd6f4]">{'(() => {'}</span></div>
              <div className="pl-8"><span className="text-[#cba6f7]">const</span> <span className="text-[#a6e3a1]">timer</span> <span className="text-[#89dceb]">=</span> <span className="text-[#89b4fa]">setTimeout</span><span className="text-[#cdd6f4]">(...)</span></div>
              <div className="pl-8"><span className="text-[#cba6f7]">return</span> <span className="text-[#cdd6f4]">{'() =>'}</span> <span className="text-[#89b4fa]">clearTimeout</span><span className="text-[#cdd6f4]">(</span><span className="text-[#a6e3a1]">timer</span><span className="text-[#cdd6f4]">)</span></div>
              <div className="pl-4"><span className="text-[#cdd6f4]">{'}'}</span><span className="text-[#cdd6f4]">, [</span><span className="text-[#a6e3a1]">value</span><span className="text-[#cdd6f4]">,</span> <span className="text-[#a6e3a1]">delay</span><span className="text-[#cdd6f4]">])</span></div>
              <div className="h-[0.85em]" />
              <div className="pl-4"><span className="text-[#cba6f7]">return</span> <span className="text-[#a6e3a1]">debouncedValue</span></div>
              <div><span className="text-[#cdd6f4]">{'}'}</span></div>
            </div>

            {/* AI tags bar */}
            <div className="px-5 py-3 bg-indigo-500/[0.08] border-t border-indigo-500/20 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-indigo-400 font-semibold whitespace-nowrap">✦ AI Generated Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {['react', 'hooks', 'typescript', 'performance', 'debounce'].map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-[11px] font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  )
}
