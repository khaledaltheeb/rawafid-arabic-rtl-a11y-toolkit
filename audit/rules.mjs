const RTL_SCRIPTS = new Set(['Adlm','Arab','Gara','Hebr','Rohg','Mand','Mend','Nkoo','Hung','Samr','Syrc','Thaa','Yezi']);

export const RULES = {
  'RAWAFID-BIDI-001': ['Unsafe bidi override control', 'Unicode UAX #9 / UTS #39'],
  'RAWAFID-BIDI-002': ['Legacy bidi embedding control', 'Unicode UAX #9'],
  'RAWAFID-BIDI-003': ['Unbalanced bidi isolate', 'Unicode UAX #9'],
  'RAWAFID-BIDI-004': ['Escaped bidi control in source', 'Unicode UAX #9 / UTS #39'],
  'RAWAFID-HTML-001': ['Document language is not declared', 'WCAG 2.2 3.1.1 / BCP 47'],
  'RAWAFID-HTML-002': ['RTL document direction is not declared', 'W3C Internationalization / HTML'],
  'RAWAFID-HTML-003': ['Language and document direction disagree', 'W3C Internationalization / BCP 47'],
  'RAWAFID-HTML-004': ['Invalid dir attribute value', 'HTML'],
  'RAWAFID-HTML-005': ['bdo element has no explicit direction', 'HTML / Unicode UAX #9'],
  'RAWAFID-HTML-006': ['Free-form text input has no automatic direction', 'W3C Internationalization'],
  'RAWAFID-CSS-001': ['Physical horizontal CSS property', 'CSS Logical Properties / W3C Internationalization'],
  'RAWAFID-CSS-002': ['Physical text alignment value', 'CSS Logical Properties'],
  'RAWAFID-CSS-003': ['CSS direction used for base direction', 'W3C Internationalization / HTML'],
  'RAWAFID-CSS-004': ['Risky unicode-bidi behavior', 'CSS Writing Modes / Unicode UAX #9'],
  'RAWAFID-CSS-005': ['Physical float or clear value', 'CSS Logical Properties'],
  'RAWAFID-UTILITY-001': ['Direction-physical utility class', 'CSS Logical Properties'],
};

const PHYSICAL_CSS = new Map([
  ['left','inset-inline-start'], ['right','inset-inline-end'],
  ['margin-left','margin-inline-start'], ['margin-right','margin-inline-end'],
  ['padding-left','padding-inline-start'], ['padding-right','padding-inline-end'],
  ['border-left','border-inline-start'], ['border-right','border-inline-end'],
  ['border-left-color','border-inline-start-color'], ['border-right-color','border-inline-end-color'],
  ['border-left-style','border-inline-start-style'], ['border-right-style','border-inline-end-style'],
  ['border-left-width','border-inline-start-width'], ['border-right-width','border-inline-end-width'],
  ['border-top-left-radius','border-start-start-radius'], ['border-top-right-radius','border-start-end-radius'],
  ['border-bottom-left-radius','border-end-start-radius'], ['border-bottom-right-radius','border-end-end-radius'],
  ['scroll-margin-left','scroll-margin-inline-start'], ['scroll-margin-right','scroll-margin-inline-end'],
  ['scroll-padding-left','scroll-padding-inline-start'], ['scroll-padding-right','scroll-padding-inline-end'],
]);
const CSS_PROPERTY_PATTERN = [...PHYSICAL_CSS.keys()].sort((a,b)=>b.length-a.length).join('|');
const MARKUP = new Set(['.htm','.html','.jsx','.tsx','.vue','.svelte']);
const CSS = new Set(['.css','.less','.sass','.scss']);
const HTML_DOCUMENT = new Set(['.htm','.html']);

function loc(source, index) {
  const before = source.slice(0, Math.max(0,index));
  const line = before.length ? before.split('\n').length : 1;
  const last = before.lastIndexOf('\n');
  return { line, column: index-last };
}
function evidence(source,index) {
  const start=source.lastIndexOf('\n',Math.max(0,index-1))+1;
  const n=source.indexOf('\n',index); const end=n<0?source.length:n;
  return source.slice(start,end).trim().slice(0,240);
}
function add(out,source,file,index,ruleId,severity,message,remediation) {
  out.push({file,ruleId,severity,message,remediation,...loc(source,index),evidence:evidence(source,index),standard:RULES[ruleId]?.[1]??''});
}
function localeDirection(lang) {
  try {
    const canonical=Intl.getCanonicalLocales(lang.trim().replaceAll('_','-'))[0];
    if(!canonical) return undefined;
    const parsed=new Intl.Locale(canonical);
    const explicit=canonical.split('-').find((x,i)=>i>0&&/^[A-Z][a-z]{3}$/u.test(x));
    const script=explicit??parsed.maximize().script;
    return script ? (RTL_SCRIPTS.has(script)?'rtl':'ltr') : undefined;
  } catch { return undefined; }
}
function maskComments(source){return source.replace(/\/\*[\s\S]*?\*\//gu,m=>m.replace(/[^\n]/gu,' '));}

function auditBidi(source,file,out){
  const stack=[]; let offset=0;
  for(const ch of source){
    const cp=ch.codePointAt(0);
    if(cp===0x202d||cp===0x202e) add(out,source,file,offset,'RAWAFID-BIDI-001','error',`Unsafe bidi override U+${cp.toString(16).toUpperCase()} is present.`,'Remove the override; use semantic dir/bdi or isolation where direction isolation is required.');
    else if(cp===0x202a||cp===0x202b||cp===0x202c) add(out,source,file,offset,'RAWAFID-BIDI-002','warning',`Legacy bidi embedding control U+${cp.toString(16).toUpperCase()} is present.`,'Prefer HTML direction or modern isolate controls in new content.');
    if(cp===0x2066||cp===0x2067||cp===0x2068) stack.push(offset);
    else if(cp===0x2069){ if(stack.length) stack.pop(); else add(out,source,file,offset,'RAWAFID-BIDI-003','error','PDI appears without an open bidi isolate.','Remove the unmatched PDI or pair it with LRI/RLI/FSI.'); }
    offset+=ch.length;
  }
  for(const index of stack) add(out,source,file,index,'RAWAFID-BIDI-003','error','A bidi isolate is not closed with PDI.','Close each LRI/RLI/FSI with PDI.');
  const escaped=/\\u(?:\{?(202A|202B|202C|202D|202E|2066|2067|2068|2069)\}?)/giu;
  for(const m of source.matchAll(escaped)){
    const cp=(m[1]??'').toUpperCase(); const severe=cp==='202D'||cp==='202E';
    add(out,source,file,m.index??0,'RAWAFID-BIDI-004',severe?'error':'warning',`Escaped bidi control U+${cp} becomes active at runtime.`,'Review and remove it unless directional control is deliberate and isolated.');
  }
}

function auditMarkup(source,file,out,{fullDocument,strict}){
  if(fullDocument){
    const html=/<html\b([^>]*)>/iu.exec(source);
    if(!html){ add(out,source,file,0,'RAWAFID-HTML-001','error','HTML document has no html element with a declared language.','Add <html lang="…" dir="…"> using a valid BCP 47 language tag.'); }
    else {
      const attrs=html[1]??''; const lang=/\blang\s*=\s*["']([^"']+)["']/iu.exec(attrs)?.[1];
      const dir=/\bdir\s*=\s*["']([^"']+)["']/iu.exec(attrs)?.[1]?.toLowerCase(); const index=html.index??0;
      if(!lang) add(out,source,file,index,'RAWAFID-HTML-001','error','Primary document language is not declared.','Add a valid BCP 47 lang attribute to <html>.');
      else {
        const expected=localeDirection(lang);
        if(expected==='rtl'&&!dir) add(out,source,file,index,'RAWAFID-HTML-002','warning',`The declared language ${lang} is RTL but <html> has no dir="rtl".`,'Declare dir="rtl" on <html>; do not rely on CSS direction for semantic base direction.');
        if(expected&&dir&&(dir==='ltr'||dir==='rtl')&&dir!==expected) add(out,source,file,index,'RAWAFID-HTML-003','error',`lang="${lang}" resolves to ${expected} while dir="${dir}".`,'Align lang/script and dir, or use an explicit BCP 47 script subtag when content intentionally uses another script.');
      }
    }
  }
  const dirPattern=/\bdir\s*=\s*["']([^"']+)["']/giu;
  for(const m of source.matchAll(dirPattern)) if(!['ltr','rtl','auto'].includes((m[1]??'').toLowerCase())) add(out,source,file,m.index??0,'RAWAFID-HTML-004','error',`Invalid dir value "${m[1]}".`,'Use dir="ltr", dir="rtl", or dir="auto".');
  const bdo=/<bdo\b([^>]*)>/giu;
  for(const m of source.matchAll(bdo)) if(!/\bdir\s*=\s*["'](?:ltr|rtl)["']/iu.test(m[1]??'')) add(out,source,file,m.index??0,'RAWAFID-HTML-005','error','<bdo> overrides bidi order but has no explicit ltr/rtl direction.','Add an explicit dir="ltr" or dir="rtl", or use <bdi> when isolation rather than override is intended.');
  if(strict){
    const controls=/<(?:textarea|input)\b([^>]*)>/giu;
    for(const m of source.matchAll(controls)){
      const attrs=m[1]??''; if(/\bdir\s*=/iu.test(attrs)) continue;
      const type=/\btype\s*=\s*["']([^"']+)["']/iu.exec(attrs)?.[1]?.toLowerCase();
      if((m[0]??'').toLowerCase().startsWith('<textarea')||!type||['text','search'].includes(type)) add(out,source,file,m.index??0,'RAWAFID-HTML-006','note','Free-form multilingual text input has no dir="auto".','Consider dir="auto" (and dirname when server-side direction must be submitted) for user-generated multilingual text.');
    }
    const classes=/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/giu;
    for(const m of source.matchAll(classes)) for(const token of (m[1]??'').split(/\s+/u)){
      const plain=token.split(':').at(-1)??token; if(/^rtl:|^ltr:/u.test(token)) continue;
      const physical=/^(?:m[lr]|p[lr]|left|right|text-(?:left|right)|float-(?:left|right)|rounded-[lr](?:-|$)|border-[lr](?:-|$))/u.test(plain);
      if(physical) add(out,source,file,m.index??0,'RAWAFID-UTILITY-001','note',`Direction-physical utility class "${token}" is static.`,'Prefer the framework logical start/end equivalent when the layout should mirror automatically.');
    }
  }
}

function auditCss(source,file,out){
  const masked=maskComments(source);
  const physical=new RegExp(`(^|[;{]\\s*)(${CSS_PROPERTY_PATTERN})\\s*:`, 'gimu');
  for(const m of masked.matchAll(physical)){
    const prop=(m[2]??'').toLowerCase(); const replacement=PHYSICAL_CSS.get(prop);
    add(out,source,file,m.index??0,'RAWAFID-CSS-001','warning',`${prop} is a physical horizontal property.`,`Use ${replacement} when the side should follow writing direction.`);
  }
  for(const m of masked.matchAll(/text-align\s*:\s*(left|right)\b/gimu)) add(out,source,file,m.index??0,'RAWAFID-CSS-002','warning',`text-align:${m[1]} is direction-physical.`,`Use text-align:${(m[1]??'').toLowerCase()==='left'?'start':'end'} when alignment follows writing direction.`);
  for(const m of masked.matchAll(/(^|[;{]\s*)direction\s*:\s*(rtl|ltr)\b/gimu)) add(out,source,file,m.index??0,'RAWAFID-CSS-003','warning',`CSS direction:${m[2]} sets base direction presentation-side.`,'Prefer the semantic HTML dir attribute; keep CSS direction only for reviewed exceptional cases.');
  for(const m of masked.matchAll(/unicode-bidi\s*:\s*(bidi-override|isolate-override|embed)\b/gimu)){
    const value=(m[1]??'').toLowerCase(); add(out,source,file,m.index??0,'RAWAFID-CSS-004',value==='embed'?'warning':'error',`unicode-bidi:${value} changes bidi ordering.`,value==='embed'?'Prefer isolation or semantic HTML direction in new content.':'Remove the override unless explicitly required and reviewed; prefer isolation for mixed-direction content.');
  }
  for(const m of masked.matchAll(/(^|[;{]\s*)(float|clear)\s*:\s*(left|right)\b/gimu)){
    const prop=(m[2]??'').toLowerCase(), value=(m[3]??'').toLowerCase(); add(out,source,file,m.index??0,'RAWAFID-CSS-005','warning',`${prop}:${value} is direction-physical.`,`Use ${prop}:${value==='left'?'inline-start':'inline-end'} when the side follows writing direction.`);
  }
}

function styleBlocks(source){
  const out=[]; for(const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/giu)){const content=m[1]??'';out.push({content,offset:(m.index??0)+(m[0]??'').indexOf(content)});} return out;
}
function rebase(diag,source,block,offset){
  let i=0,line=1; while(line<diag.line&&i<block.length){const n=block.indexOf('\n',i);if(n<0){i=block.length;break;}i=n+1;line++;} i+=Math.max(0,diag.column-1); const at=offset+i; return {...diag,...loc(source,at),evidence:evidence(source,at)};
}

export function auditSource(source,file,extension,{strict=false}={}){
  const out=[]; auditBidi(source,file,out);
  if(MARKUP.has(extension)) auditMarkup(source,file,out,{fullDocument:HTML_DOCUMENT.has(extension),strict});
  if(CSS.has(extension)) auditCss(source,file,out);
  if(MARKUP.has(extension)) for(const block of styleBlocks(source)){const local=[];auditCss(block.content,file,local);out.push(...local.map(d=>rebase(d,source,block.content,block.offset)));}
  return out;
}
