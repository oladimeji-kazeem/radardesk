import React, { useState, useEffect } from 'react';
import { Article, User, Topic, AIPreValidation, WorkflowConfig } from '../types';
import { 
  FileEdit, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Send, 
  Clock, 
  History, 
  CornerDownRight, 
  BadgeAlert, 
  Award, 
  Check, 
  Eye,
  Settings,
  Flame,
  FileCheck2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link,
  Image as ImageIcon,
  Columns as ColumnsIcon,
  CheckSquare,
  FileText,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

interface WriterPortalProps {
  currentUser: User;
  articles: Article[];
  claimedTopics: Topic[];
  activeTopic: Topic | null;
  activeArticleForEditing?: Article | null;
  onClearActiveArticleForEditing?: () => void;
  config: WorkflowConfig;
  onClearActiveTopic: () => void;
  onSaveDraft: (id: string | null, title: string, content: string, topicId: string | null) => Promise<Article | void>;
  onSubmitArticle: (id: string) => Promise<{ success: boolean; message: string; article: Article }>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export default function WriterPortal({
  currentUser,
  articles,
  claimedTopics,
  activeTopic,
  activeArticleForEditing,
  onClearActiveArticleForEditing,
  config,
  onClearActiveTopic,
  onSaveDraft,
  onSubmitArticle,
  onAddToast,
}: WriterPortalProps) {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  // Checking indicators
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  // Added interactive modes
  const [editorMode, setEditorMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [showImagePane, setShowImagePane] = useState(false);

  // Load article on selecting from drafting queue or external trigger
  const currentArticle = articles.find(a => a.id === activeArticleId);

  useEffect(() => {
    if (activeArticleForEditing) {
      setActiveArticleId(activeArticleForEditing.id);
      setTitle(activeArticleForEditing.title);
      setContent(activeArticleForEditing.content);
      setSelectedTopicId(activeArticleForEditing.topicId);
      onClearActiveArticleForEditing?.();
      setActiveTab('editor');
      setEditorMode('split'); // Beautiful default split-editor for fast preview
      onAddToast(`Loaded manuscript: "${activeArticleForEditing.title}"`, 'info');
    }
  }, [activeArticleForEditing]);

  const STOCK_IMAGES = [
    { name: 'Tokyo Alleys', caption: 'Tokyo Night Sky - Shibuya, Japan', url: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800' },
    { name: 'Eiffel View', caption: 'Morning Bistro view of Eiffel Tower - Paris, France', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800' },
    { name: 'Mt Fuji', caption: 'Blossoms with snowy Mt Fuji - Shizuoka, Japan', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800' },
    { name: 'Amalfi Coast', caption: 'Scenic Pastel villages on Amalfi Cliffside - Italy', url: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=800' },
    { name: 'Maldives Overwater', caption: 'Exclusive Overwater Lagoons - Maldives Resort', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800' },
    { name: 'Swiss Alp Railroad', caption: 'Alpine Pass railway on Swiss Rails - Switzerland', url: 'https://images.unsplash.com/photo-1532003885409-ed84d334f6ee?q=80&w=800' },
    { name: 'Venice Gondola', caption: 'Cozy Gondola along Venice canals - Venice, Italy', url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800' },
    { name: 'Icelandic Aurora', caption: 'Green Northern Lights over glacial lagoon - Iceland', url: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?q=80&w=800' },
  ];

  // Precision formatting insertion support wrapping active visual selections
  const insertFormat = (before: string, after: string = '') => {
    const textarea = document.getElementById('scribe-markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setContent(prev => prev + before + after);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = before + (selectedText || '') + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setContent(newContent);
    onAddToast("Formatted element inserted", 'info');
    
    // Resume editor focus
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleInsertTemplate = (type: 'guide' | 'dining' | 'checklist') => {
    let tpl = '';
    if (type === 'guide') {
      tpl = `\n## Scenic Travel Guide: [Location Name]\n\nIntroduce this hidden gem travel experience here. Explain why it stands out from mainstream spots.\n\n### Primary Highlights & Visual Landmarks\n![Breathtaking Sunset View](https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=800)\n\n- **Must-Visit Spot 1**: Detailed explanation of when to visit.\n- **Must-Visit Spot 2**: Budget travel tip or off-grid trail advice.\n\n### Local Culture & Secrets\nProvide cultural nuances that other guidelines miss.\n\n### References & Resources\n- [Primary Destination Authority](https://wikipedia.org)\n- [Local Transport Maps](https://google.com)`;
    } else if (type === 'dining') {
      tpl = `\n## Hidden Culinary Gems: [City/Region Name] Hidden Food Tour\n\nWhere do locals eat away from mainstream lists? Here is a curated selection.\n\n### Cozy Dining & Cafe Spots\n![Bespoke Dining Table](https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800)\n\n- **Venue A**: Try their authentic local pastry. Best enjoyed before 9 AM.\n- **Venue B**: A family-owned bistro with homebrewed specialty drinks.\n\n### Cost & Practical Sourcing\nEstimates: $15 - $30 per head.\n\n### Citations & Verified Maps\n- [Regional Food Critics Guide](https://wikipedia.org)`;
    } else {
      tpl = `\n## Adventure Packing & Action Checklist\n\nAre you ready for your next travel tour? Cross-reference with our expert list.\n\n### Pre-Departure Action Steps\n- [ ] Double check flight and visa coordinates\n- [ ] Pre-purchase high pass railway ticket cards\n- [ ] Grab heavy-duty camera lenses for landmarks\n\n### Recommended Gear Checklist\n- *Item 1*: Lightweight windbreaker coat\n- *Item 2*: Instant filter water bottle flask\n\n### Essential Resources\n- [Global Foreign Exchange Rates](https://wikipedia.org)`;
    }
    setContent(prev => prev + tpl);
    onAddToast('Draft template style loaded in editor', 'success');
  };

  // Custom simple yet elegant markdown-to-HTML formatter to render live inline styled previews
  const renderMarkdownToHTML = (mdText: string) => {
    if (!mdText) return <p className="text-slate-400 italic font-sans text-xs">Awaiting content input...</p>;
    
    const lines = mdText.split('\n');
    let insideList = false;
    let listItems: string[] = [];
    const elements: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        const itemNodes = listItems.map((li, idx) => {
          const text = parseInlineStyles(li);
          return (
            <li key={`li-${idx}`} className="text-slate-600 hover:text-slate-900 transition-colors py-0.5 ml-5 list-disc leading-relaxed text-xs">
              {text}
            </li>
          );
        });
        elements.push(<ul key={`ul-${elements.length}`} className="my-2.5 space-y-1 list-disc font-sans">{itemNodes}</ul>);
        listItems = [];
        insideList = false;
      }
    };

    const parseInlineStyles = (txt: string): React.ReactNode => {
      let parts: React.ReactNode[] = [txt];

      // Match [text](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
      let linkMatch;
      while ((linkMatch = linkRegex.exec(txt)) !== null) {
        const [full, btnText, url] = linkMatch;
        const index = txt.indexOf(full);
        const beforeTxt = txt.substring(0, index);
        const afterTxt = txt.substring(index + full.length);
        
        parts = [
          ...parts.slice(0, -1),
          beforeTxt,
          <a key={`link-${index}`} href={url} target="_blank" rel="noopener noreferrer" className="text-[#20a6eb] underline font-bold hover:text-[#e86420] transition-colors inline-block" onClick={(e) => e.stopPropagation()}>
            {btnText}
          </a>,
          afterTxt
        ];
        txt = afterTxt;
      }

      // Re-evaluate with bold **bold**
      let reParts: React.ReactNode[] = [];
      for (const p of parts) {
        if (typeof p !== 'string') {
          reParts.push(p);
          continue;
        }
        
        let subTxt = p;
        const boldRegex = /\*\*([^*]+)\*\*/;
        let boldMatch;
        let subParts: React.ReactNode[] = [];
        
        while ((boldMatch = boldRegex.exec(subTxt)) !== null) {
          const [full, content] = boldMatch;
          const index = subTxt.indexOf(full);
          const before = subTxt.substring(0, index);
          subParts.push(before);
          subParts.push(<strong key={`b-${index}`} className="font-extrabold text-slate-900">{content}</strong>);
          subTxt = subTxt.substring(index + full.length);
        }
        subParts.push(subTxt);
        reParts = [...reParts, ...subParts];
      }

      // Re-evaluate with italic
      let finalParts: React.ReactNode[] = [];
      for (const p of reParts) {
        if (typeof p !== 'string') {
          finalParts.push(p);
          continue;
        }
        
        let subTxt = p;
        const italicRegex = /\*([^*]+)\*/;
        let italicMatch;
        let subParts: React.ReactNode[] = [];
        
        while ((italicMatch = italicRegex.exec(subTxt)) !== null) {
          const [full, content] = italicMatch;
          const index = subTxt.indexOf(full);
          const before = subTxt.substring(0, index);
          subParts.push(before);
          subParts.push(<em key={`i-${index}`} className="italic text-slate-700">{content}</em>);
          subTxt = subTxt.substring(index + full.length);
        }
        subParts.push(subTxt);
        finalParts = [...finalParts, ...subParts];
      }

      return finalParts.length > 0 ? (
        <span className="leading-relaxed font-sans text-xs select-text">{finalParts}</span>
      ) : (
        txt
      );
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${i}`} className="text-lg md:text-xl font-black font-display tracking-tight text-slate-900 border-b border-slate-100 pb-1.5 mt-4 mb-2 select-text">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-base md:text-md font-bold font-display tracking-tight text-slate-800 mt-4 mb-2 select-text">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-xs md:text-sm font-bold font-sans tracking-tight text-[#363636] mt-3.5 mb-1.5 select-text">
            {line.substring(4)}
          </h3>
        );
      } 
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-4 border-[#20a6eb] bg-slate-50/50 p-3 rounded-r-xl italic my-3 text-slate-600 pl-4 font-sans select-text text-xs leading-relaxed">
            {line.substring(2)}
          </blockquote>
        );
      } 
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        insideList = true;
        listItems.push(line.substring(2));
      } 
      else if (line === '---' || line === '***') {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="border-t border-slate-200 my-4" />);
      }
      else if (line.startsWith('![') && line.includes('](')) {
        flushList();
        const capEndIdx = line.indexOf(']');
        const urlStartIdx = line.indexOf('(') + 1;
        const urlEndIdx = line.indexOf(')');
        if (capEndIdx !== -1 && urlEndIdx !== -1) {
          const caption = line.substring(2, capEndIdx);
          const url = line.substring(urlStartIdx, urlEndIdx);
          elements.push(
            <div key={`img-${i}`} className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm relative max-w-full">
              <img 
                src={url} 
                alt={caption} 
                className="w-full max-h-[220px] object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="bg-white text-[10px] text-slate-400 font-mono py-1.5 px-3 text-center border-t border-slate-100 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e86420]" />
                <span>Doc Visual: <strong>{caption || "Travel Destination Cover Photo"}</strong></span>
              </div>
            </div>
          );
        }
      }
      else if (line.length > 0) {
        if (insideList) {
          flushList();
        }
        elements.push(
          <p key={`p-${i}`} className="text-xs text-slate-600 my-2 font-sans leading-relaxed select-text">
            {parseInlineStyles(line)}
          </p>
        );
      } else {
        if (insideList) {
          flushList();
        }
      }
    }
    
    flushList();
    return <div className="space-y-1 text-left select-text p-1">{elements}</div>;
  };

  useEffect(() => {
    if (activeTopic) {
      setTitle(`Special Coverage: ${activeTopic.title}`);
      setContent(`## ${activeTopic.title}\n\nIntroduce the core travel destination concept here...\n\n### Local Guides & Spots\n- Point 1\n- Point 2\n\n### References\n- Add a verified travel reference link here.`);
      setSelectedTopicId(activeTopic.id);
      setActiveArticleId(null); // working on new article
      setActiveTab('editor');
    }
  }, [activeTopic]);

  const loadArticleForEditing = (art: Article) => {
    setActiveArticleId(art.id);
    setTitle(art.title);
    setContent(art.content);
    setSelectedTopicId(art.topicId);
    onClearActiveTopic();
    setActiveTab('editor');
  };

  const createBlankDraft = () => {
    setActiveArticleId(null);
    setTitle('');
    setContent('## Headline Section\n\nWrite article body contents here following strict AP Style with Markdown structure...\n\n### References\n- List resources or authority links here.');
    setSelectedTopicId(null);
    onClearActiveTopic();
  };

  const handleSave = async (showNotification = true) => {
    if (!title.trim() || !content.trim()) {
      if (showNotification) {
        onAddToast('Please input title and text body before saving drafts.', 'error');
      }
      return;
    }
    
    setIsSaving(true);
    try {
      const saved = await onSaveDraft(activeArticleId, title, content, selectedTopicId);
      if (saved) {
        setActiveArticleId(saved.id);
      }
      if (showNotification) {
        onAddToast('Draft saved successfully to persistent local storage.', 'success');
      }
    } catch {
      onAddToast('Error saving draft, try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save simulation
  useEffect(() => {
    if (!title.trim() || !content.trim()) return;
    const interval = setTimeout(() => {
      handleSave(false);
    }, 15000); // Autosave every 15 secs
    return () => clearTimeout(interval);
  }, [title, content]);

  const handleSubmit = async () => {
    if (!activeArticleId) {
      onAddToast('Please save your active draft before submitting for review.', 'warning');
      return;
    }
    
    // Quick checklists local validation checks
    const wCount = content.split(/\s+/).filter(Boolean).length;
    const references = content.includes('http://') || content.includes('https://') || content.toLowerCase().includes('source');
    
    if (wCount < 40) {
      onAddToast('Local validation rejected: Draft length is too short to pass editorial threshold guidelines (minimum 40 words).', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calls Server-side submission orchestrator. 
      // Server evaluates Quality check with Gemini AI Flash Model.
      // If score is less than config threshold, server blocks.
      const response = await onSubmitArticle(activeArticleId);
      if (response.success) {
        onAddToast(response.message, 'success');
        createBlankDraft();
      } else {
        // blocked by pre-validation
        onAddToast(response.message, 'warning');
        // trigger reload to sync validation score indicators
      }
    } catch (e: any) {
      onAddToast('Error submitting article to review channel.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computes instantaneous statistics
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const paragraphCount = content.split('\n\n').filter(Boolean).length;
  const matchesTemplate = content.includes('### References') || content.includes('##') || content.includes('Sources');

  return (
    <div className="space-y-6" id="writer-portal-module">
      
      {/* Dynamic top tabs switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-5 py-2.5 font-semibold text-sm -mb-px flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'editor' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Composition Draftboard</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 font-semibold text-sm -mb-px flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>My Manuscripts ({articles.filter(a => a.writerId === currentUser.id).length})</span>
        </button>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main composition board */}
          <div className="xl:col-span-8 space-y-4">
            
            {activeTopic && (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 p-3.5 rounded-xl text-xs text-orange-800 animate-pulse">
                <p className="flex items-center gap-2 font-medium">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Drafting claimed topic: <strong>{activeTopic.title}</strong></span>
                </p>
                <button 
                  onClick={onClearActiveTopic}
                  className="text-orange-900 font-bold underline hover:text-orange-950 cursor-pointer"
                >
                  Deselect topic
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 text-left">
              
              {/* Dynamic Editor Mode Header Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => { setEditorMode('edit'); setShowImagePane(false); }}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${editorMode === 'edit' ? 'bg-[#363636] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Scribe Only
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditorMode('split'); setShowImagePane(false); }}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${editorMode === 'split' ? 'bg-[#363636] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Split Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditorMode('preview'); setShowImagePane(false); }}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${editorMode === 'preview' ? 'bg-[#363636] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Full Preview
                  </button>
                </div>

                {/* Templates Injection Picker */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Use Style Template:</span>
                  <select
                    onChange={(e) => {
                      if(e.target.value) {
                        handleInsertTemplate(e.target.value as any);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    className="border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-300"
                  >
                    <option value="">-- Choose Template --</option>
                    <option value="guide">Panoramic Destination Guide</option>
                    <option value="dining">Hidden Local Culinary Secrets</option>
                    <option value="checklist">Extreme Adventure Travel Checklist</option>
                  </select>
                </div>
              </div>

              {/* Headline and Topic attachment */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Article Headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl font-black border-b border-slate-200 pb-2 focus:outline-none focus:border-[#20a6eb] text-slate-800 font-display transition-colors bg-transparent"
                />
                
                {claimedTopics.length > 0 && !activeTopic && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">Attach claimed travel topic reference code:</span>
                    <select
                      value={selectedTopicId || ''}
                      onChange={(e) => setSelectedTopicId(e.target.value || null)}
                      className="border border-slate-200 rounded-lg p-1 bg-white text-slate-600 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="">No Active Topic</option>
                      {claimedTopics.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Full Featured Formatting Toolbar */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-600 flex-wrap">
                <button
                  type="button"
                  onClick={() => insertFormat('**', '**')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Bold (Selection)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('*', '*')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Italic (Selection)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <span className="h-5 w-px bg-slate-300 mx-1" />
                
                <button
                  type="button"
                  onClick={() => insertFormat('# ', '\n')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="H1 Heading"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('## ', '\n')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="H2 Section Heading"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('### ', '\n')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="H3 Subsection Title"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <span className="h-5 w-px bg-slate-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormat('\n- ')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('\n1. ')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Ordered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('\n- [ ] ')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Checklist Item"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('\n> ')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Blockquote Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <span className="h-5 w-px bg-slate-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormat('[Link Display Text](', ')')}
                  className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300/50 cursor-pointer text-slate-700"
                  title="Hyperlink Resource"
                >
                  <Link className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowImagePane(!showImagePane)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer border ${showImagePane ? 'bg-orange-500 text-white border-orange-600' : 'bg-white hover:bg-orange-50 text-orange-600 border-orange-200'}`}
                  title="Curated Travel Image Drawer Palette"
                >
                  <ImageIcon className="w-3.5 h-3.5 animate-bounce" />
                  <span>Add Travel Image</span>
                </button>

                <span className="ml-auto text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400">Pro Scribe Editor</span>
              </div>

              {/* 4. Curated Travel Image Drawer Palette Area */}
              {showImagePane && (
                <div className="bg-orange-50/50 border border-orange-150 p-4 rounded-xl space-y-3 animation-fade text-left">
                  <div className="flex items-center justify-between border-b border-orange-200 pb-1.5">
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-[#363636] text-xs">Stock Travel Photography Catalog</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Click on any visual concept to inject high resolution image into active cursor slot</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImagePane(false)}
                      className="text-xs text-orange-900 font-extrabold hover:underline"
                    >
                      Close drawer
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STOCK_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          insertFormat(`\n![${img.caption}](${img.url})\n`);
                          onAddToast(`Inserted image: ${img.name}`, 'success');
                        }}
                        className="group flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm hover:border-orange-400 transition-all text-left cursor-pointer"
                      >
                        <div className="w-full h-20 overflow-hidden relative">
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-1.5 text-center text-[10px] font-bold text-slate-700 bg-slate-50 truncate">
                          {img.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Editing Grid Pane based on editorMode */}
              <div className="grid grid-cols-1 gap-6">
                
                {editorMode === 'edit' && (
                  <textarea
                    id="scribe-markdown-textarea"
                    placeholder="Compose travel coverage. Highlight sections with H2/H3 hash templates. Use markdown brackets to cite reference links."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    className="w-full text-xs leading-relaxed p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-slate-700 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all select-text shadow-inner"
                  />
                )}

                {editorMode === 'split' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="flex flex-col space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Scribe Source Code</span>
                      <textarea
                        id="scribe-markdown-textarea"
                        placeholder="Compose travel coverage. Highlight sections with H2/H3 hash templates. Use markdown brackets to cite reference links."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[400px] text-xs leading-relaxed p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-slate-700 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all select-text shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Live Document Preview</span>
                      <div className="w-full h-[400px] overflow-y-auto p-5 rounded-xl border border-slate-200 bg-[#f9fbff]/60 text-slate-700 font-sans shadow-inner select-text prose prose-slate">
                        {renderMarkdownToHTML(content)}
                      </div>
                    </div>
                  </div>
                )}

                {editorMode === 'preview' && (
                  <div className="p-1 max-w-2xl mx-auto space-y-4">
                    <div className="text-center pb-4 border-b">
                      <span className="text-[9px] font-mono bg-[#e86420]/10 text-[#e86420] px-2.5 py-1 rounded-full uppercase tracking-widest font-black inline-block mb-2">Live Proofing Screen</span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">{title || "(Awaiting Headlines)"}</h2>
                      <p className="text-xs text-slate-400 mt-1">Author: {currentUser.name} | Dynamic Live Render Engine v2</p>
                    </div>
                    <div className="p-8 rounded-2xl border border-slate-200 bg-white text-slate-700 font-sans shadow select-text prose prose-slate">
                      {renderMarkdownToHTML(content)}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom bar with counts & buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Words: <strong>{wordCount}</strong></span>
                  <span>Paragraphs: <strong>{paragraphCount}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={createBlankDraft}
                    className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                  >
                    Clear Slate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : '💾 Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !activeArticleId}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title={!activeArticleId ? 'Please save the draft first!' : 'Trigger AI Pre-validation Scoring'}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Verifying...' : 'Submit to Duty Editor'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* AI Optimization Prevalidation Feedback section */}
            {currentArticle?.aiValidation && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <h4 className="font-bold text-sm tracking-tight text-slate-100">AI Pre-Validation Gatekeeper Assessment</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">Quality Score:</span>
                    <span className={`text-base font-black px-2.5 py-0.5 rounded-full font-mono ${
                      currentArticle.aiValidation.score >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                      currentArticle.aiValidation.score >= 70 ? 'bg-sky-500/20 text-sky-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {currentArticle.aiValidation.score}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Grammar & Punctuation</p>
                    <p className="text-slate-200 leading-relaxed font-mono">{currentArticle.aiValidation.grammar}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Readability Insights</p>
                    <p className="text-slate-200 leading-relaxed font-mono">{currentArticle.aiValidation.readability}</p>
                  </div>
                </div>

                {currentArticle.aiValidation.styleGuideViolations.length > 0 && (
                  <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg text-xs space-y-1">
                    <p className="text-rose-400 font-bold flex items-center gap-1">
                      <BadgeAlert className="w-4 h-4 shrink-0" />
                      <span>AP Style Guide Advisory Recommendations</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {currentArticle.aiValidation.styleGuideViolations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Similarity detection details */}
                <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-lg text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400">Content Originality Index:</span>
                    <span className={`ml-1 font-bold ${currentArticle.aiValidation.isDuplicate ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {currentArticle.aiValidation.isDuplicate ? 'Potential Duplicate' : 'Unique Document'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Semantic Resubmission Match:</span>
                    <span className="font-bold ml-1 text-sky-400">
                      {(currentArticle.aiValidation.semanticSimilarityToPrevious * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Headline suggestions */}
                <div className="space-y-2">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Engaging Headline Proposals</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {currentArticle.aiValidation.headlineSuggestions.map((hl, k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTitle(hl)}
                        className="text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-755 hover:border-slate-500 cursor-pointer text-[11px] leading-snug transition-all"
                      >
                        "{hl}"
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right sidebar checklists / checklist requirements info */}
          <div className="xl:col-span-4 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4.5 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span>Pre-submission Checklist</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 text-xs">
                  <span className={`mt-0.5 shrink-0 ${wordCount >= 40 ? 'text-emerald-600' : 'text-slate-300'}`}>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </span>
                  <div>
                    <p className={`font-semibold ${wordCount >= 40 ? 'text-slate-800' : 'text-slate-600'}`}>Word Count Limit</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Platforms require write-ups to exceed 40 words. Current: {wordCount}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 text-xs">
                  <span className={`mt-0.5 shrink-0 ${content.toLowerCase().match(/https?:\/\/[^\s]+|www\.[^\s]+/gi) ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Citations & References Included</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Sources increase factual scoring. Include links prefixing HTTP/HTTPS.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 text-xs">
                  <span className={`mt-0.5 shrink-0 ${matchesTemplate ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Heading Template Pattern</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Utilize formatting with markup syntax heading hashtags.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 text-xs">
                  <span className={`mt-0.5 shrink-0 ${currentArticle?.aiValidation && currentArticle.aiValidation.score >= config.aiScoreThreshold ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">AI Quality Check Score Over {config.aiScoreThreshold}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">The platform gate blocks submissions falling short. Current: {currentArticle?.aiValidation?.score || 'No score yet'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick access drafts queue */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-xs space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm">Save & Resume Writing</h4>
              
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {articles.filter(a => a.writerId === currentUser.id && ['Draft', 'Minor Revision', 'Rejected'].includes(a.status)).length === 0 ? (
                  <p className="text-slate-400 text-center py-4 italic">No active drafts found.</p>
                ) : (
                  articles.filter(a => a.writerId === currentUser.id && ['Draft', 'Minor Revision', 'Rejected'].includes(a.status)).map(art => (
                    <button
                      key={art.id}
                      onClick={() => loadArticleForEditing(art)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer ${
                        art.id === activeArticleId 
                          ? 'bg-cyan-50 border-cyan-200 text-cyan-900 font-semibold' 
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold truncate max-w-[120px]">{art.title || '(Untitled Draft)'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          art.status === 'Minor Revision' ? 'bg-amber-100 text-amber-700' :
                          art.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {art.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Updated: {new Date(art.updatedAt).toLocaleTimeString()}</span>
                        {art.score > 0 && <span className="font-mono">Score: {art.score}</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* History lists tab view */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-base mb-4">Submission Repository</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <th className="p-3">Manuscript Details</th>
                  <th className="p-3">Workflow State</th>
                  <th className="p-3">Quality Score</th>
                  <th className="p-4">Assigned Reviewer</th>
                  <th className="p-3">Submission Date</th>
                  <th className="p-3">Revisions Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {articles.filter(a => a.writerId === currentUser.id).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">No publications authored yet.</td>
                  </tr>
                ) : (
                  articles.filter(a => a.writerId === currentUser.id).map(art => (
                    <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold">
                        <div className="flex flex-col gap-0.5">
                          <span>{art.title}</span>
                          <span className="text-[10px] text-slate-400">ID: {art.id}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          art.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                          art.status === 'Submitted' ? 'bg-indigo-100 text-indigo-800' :
                          art.status === 'Escalated' ? 'bg-purple-100 text-purple-800' :
                          art.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold">{art.score > 0 ? `${art.score}/100` : '--'}</td>
                      <td className="p-3">{art.editorName || 'Unassigned (General Queue)'}</td>
                      <td className="p-3 text-slate-400">{art.submittedAt ? new Date(art.submittedAt).toLocaleString() : 'Draft'}</td>
                      <td className="p-3 text-slate-400 font-mono">
                        {art.revisions.length} iterations (rejections: {art.reviewCycles})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
