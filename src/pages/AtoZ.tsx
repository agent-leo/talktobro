import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, ArrowUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getEntriesByLetter, getAvailableLetters, GlossaryEntry, glossaryEntries } from '@/data/glossaryData';
import { conversationFlows } from '@/data/conversationFlows';

const AtoZ = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Initialize search from URL query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  
  const entriesByLetter = useMemo(() => getEntriesByLetter(), []);
  const availableLetters = useMemo(() => getAvailableLetters(), []);
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(glossaryEntries.map(e => e.category));
    return Array.from(cats).sort();
  }, []);
  
  // Filter entries based on search and category
  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered: Record<string, GlossaryEntry[]> = {};
    
    Object.entries(entriesByLetter).forEach(([letter, entries]) => {
      const matchingEntries = entries.filter(entry => {
        const matchesSearch = !query || 
          entry.term.toLowerCase().includes(query) ||
          entry.description.toLowerCase().includes(query) ||
          entry.category.toLowerCase().includes(query);
        const matchesCategory = !selectedCategory || entry.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      if (matchingEntries.length > 0) {
        filtered[letter] = matchingEntries;
      }
    });
    
    return filtered;
  }, [searchQuery, selectedCategory, entriesByLetter]);
  
  const handleEntryClick = (entry: GlossaryEntry) => {
    if (entry.flowId) {
      navigate(`/?flow=${entry.flowId}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="font-serif text-xl text-foreground">TalkToBro</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for any term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-secondary/50 border-border/50"
            />
            {(searchQuery || selectedCategory) && (
              <button 
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-foreground text-background'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Letter Navigation */}
        <div className="max-w-3xl mx-auto px-6 pb-3 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {availableLetters.map(letter => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className={`px-2.5 py-1 text-sm rounded transition-colors ${
                  filteredEntries[letter]
                    ? 'text-foreground hover:bg-secondary'
                    : 'text-muted-foreground/40 pointer-events-none'
                }`}
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="a-z-main" className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            A to Z
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A glossary of what we actually mean when we talk about trading psychology. 
            Some terms link to conversations — tap them to start.
          </p>
        </div>

        <div className="border-t border-border" />

        {/* Entries by Letter */}
        <div className="divide-y divide-border/50">
          {Object.entries(filteredEntries).map(([letter, entries]) => (
            <section key={letter} id={`letter-${letter}`} className="py-8">
              <h3 className="font-serif text-2xl text-foreground mb-6">{letter}</h3>
              <ul className="space-y-4">
                {entries.map((entry, index) => (
                  <li key={`${entry.id}-${index}`}>
                    {entry.flowId ? (
                      <button
                        onClick={() => handleEntryClick(entry)}
                        className="text-left group w-full"
                      >
                        <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                          {entry.term}
                        </span>
                        <br />
                        <span className="text-muted-foreground text-sm">
                          ({conversationFlows[entry.flowId]?.title || entry.category})
                        </span>
                        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                          {entry.description}
                        </p>
                      </button>
                    ) : (
                      <div>
                        <span className="font-medium text-foreground">
                          {entry.term}
                        </span>
                        <br />
                        <span className="text-muted-foreground text-sm">
                          ({entry.category})
                        </span>
                        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                          {entry.description}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={scrollToTop}
                className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Return to top <ArrowUp className="w-3 h-3" />
              </button>
            </section>
          ))}
        </div>

        {Object.keys(filteredEntries).length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No matching terms found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 TalkToBro</p>
          <div className="flex items-center gap-4">
            <Link to="/crisis" className="hover:text-foreground transition-colors">
              Crisis Resources
            </Link>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">A place to pause</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AtoZ;
