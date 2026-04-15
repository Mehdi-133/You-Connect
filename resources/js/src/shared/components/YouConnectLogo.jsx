export function YouConnectLogo({ compact = false, showTag = true, className = '' }) {
    const sizeClasses = compact
        ? {
              wrap: 'gap-1.5',
              word: 'text-[1.95rem] md:text-[2.2rem]',
              tag: 'text-[10px] px-3 py-1',
          }
        : {
              wrap: 'gap-2.5',
              word: 'text-[3.4rem] md:text-[5rem] lg:text-[6rem]',
              tag: 'text-xs px-4 py-1.5',
          };

    return (
        <div className={`inline-flex flex-col items-start ${sizeClasses.wrap} ${className}`}>
            <div className="leading-none">
                <div className="font-display text-[#FFF3DC] [text-shadow:4px_4px_0_rgba(0,0,0,0.85)]">
                    <span className={`${sizeClasses.word} inline-block rotate-[-7deg] font-extrabold`}>Y</span>
                    <span className={`${sizeClasses.word} inline-block -rotate-[5deg] text-[#29CFFF] font-extrabold`}>o</span>
                    <span className={`${sizeClasses.word} inline-block rotate-[4deg] text-[#FFD327] font-extrabold`}>u</span>
                </div>

                <div className="-mt-2 font-display text-[#FFF3DC] [text-shadow:4px_4px_0_rgba(0,0,0,0.85)]">
                    <span className={`${sizeClasses.word} inline-block rotate-[-10deg] text-[#A34DFF] font-extrabold`}>C</span>
                    <span className={`${sizeClasses.word} inline-block rotate-[3deg] text-[#25F2A0] font-extrabold`}>o</span>
                    <span className={`${sizeClasses.word} inline-block -rotate-[4deg] text-[#29CFFF] font-extrabold`}>n</span>
                    <span className={`${sizeClasses.word} inline-block rotate-[8deg] text-[#FFD327] font-extrabold`}>n</span>
                    <span className={`${sizeClasses.word} inline-block -rotate-[7deg] text-[#FF66D6] font-extrabold`}>e</span>
                    <span className={`${sizeClasses.word} inline-block rotate-[6deg] text-[#25F2A0] font-extrabold`}>c</span>
                    <span className={`${sizeClasses.word} inline-block -rotate-[3deg] text-[#FFF3DC] font-extrabold`}>t</span>
                </div>
            </div>

            {showTag && (
                <span
                    className={`inline-flex rounded-full bg-[#FFF3DC] font-black uppercase tracking-[0.22em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] ${sizeClasses.tag}`}
                >
                    Coding Community
                </span>
            )}
        </div>
    );
}
