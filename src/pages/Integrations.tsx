import { Link } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { Header } from '@/components/Header';

const logoClass = (url?: string) =>
  `w-8 h-8${url?.includes('ffffff') || url?.includes('white') ? ' invert dark:invert-0' : url?.includes('111111') ? ' dark:invert' : ''}`;

interface Integration {
  name: string;
  desc: string;
  logo: string;
  fallbackLogo?: string;
  isIcon?: boolean;
}

function Section({ title, desc, items }: { title: string; desc: string; items: Integration[] }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
        <span className="text-accent">⟩</span> {title}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/40 transition-colors text-center"
          >
            {item.isIcon ? (
              <Camera className="w-8 h-8 text-foreground" />
            ) : item.fallbackLogo ? (
              <>
                <img src={item.logo} alt={item.name} className={`${logoClass(item.logo)} hidden sm:block`} loading="lazy" />
                <img src={item.fallbackLogo} alt={item.name} className="w-8 h-8 sm:hidden" loading="lazy" />
              </>
            ) : (
              <img src={item.logo} alt={item.name} className={logoClass(item.logo)} loading="lazy" />
            )}
            <div>
              <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Integrations</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              50+ integrations with the apps and services you already use.<br />
              Chat from your phone, control from your desktop, automate everything.
            </p>
          </div>

          <Section
            title="Chat Providers"
            desc="Message Bro from any chat app — it responds right where you are."
            items={[
              { name: 'WhatsApp', desc: 'QR pairing via Baileys', logo: 'https://cdn.simpleicons.org/whatsapp/25D366' },
              { name: 'Telegram', desc: 'Bot API via grammY', logo: 'https://cdn.simpleicons.org/telegram/26A5E4' },
              { name: 'Discord', desc: 'Servers, channels & DMs', logo: 'https://cdn.simpleicons.org/discord/5865F2' },
              { name: 'Slack', desc: 'Workspace apps via Bolt', logo: 'https://www.google.com/s2/favicons?domain=slack.com&sz=64' },
              { name: 'Signal', desc: 'Privacy-focused via signal-cli', logo: 'https://cdn.simpleicons.org/signal/3A76F0' },
              { name: 'iMessage', desc: 'AppleScript bridge', logo: 'https://cdn.simpleicons.org/apple/ffffff' },
              { name: 'Microsoft Teams', desc: 'Enterprise support', logo: 'https://www.google.com/s2/favicons?domain=teams.microsoft.com&sz=64' },
              { name: 'Nextcloud Talk', desc: 'Self-hosted chat', logo: 'https://cdn.simpleicons.org/nextcloud/0082C9' },
              { name: 'Matrix', desc: 'Matrix protocol', logo: 'https://cdn.simpleicons.org/matrix/ffffff' },
              { name: 'Zalo', desc: 'Vietnamese messenger', logo: 'https://www.google.com/s2/favicons?domain=zalo.me&sz=64' },
            ]}
          />

          <Section
            title="AI Models"
            desc="Use any model you want — cloud or local. Your keys, your choice."
            items={[
              { name: 'Anthropic', desc: 'Claude 3.5/4/Opus', logo: 'https://cdn.simpleicons.org/anthropic/FF6B35' },
              { name: 'OpenAI', desc: 'GPT-4/5 & o1/o3', logo: 'https://cdn.simpleicons.org/openai/white', fallbackLogo: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64' },
              { name: 'Google', desc: 'Gemini models', logo: 'https://cdn.simpleicons.org/google/4285F4' },
              { name: 'DeepSeek', desc: 'R1 reasoning', logo: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=64' },
              { name: 'xAI', desc: 'Grok models', logo: 'https://www.google.com/s2/favicons?domain=x.ai&sz=64' },
              { name: 'Vercel AI Gateway', desc: 'Multi-provider routing', logo: 'https://cdn.simpleicons.org/vercel/ffffff' },
              { name: 'OpenRouter', desc: '200+ models', logo: 'https://www.google.com/s2/favicons?domain=openrouter.ai&sz=64' },
              { name: 'Mistral', desc: 'Mistral models', logo: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=64' },
              { name: 'Ollama', desc: 'Local model runner', logo: 'https://cdn.simpleicons.org/ollama/ffffff' },
              { name: 'LM Studio', desc: 'Desktop LLM host', logo: 'https://www.google.com/s2/favicons?domain=lmstudio.ai&sz=64' },
              { name: 'Perplexity', desc: 'Search + reasoning', logo: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64' },
              { name: 'Hugging Face', desc: 'Open model hub', logo: 'https://cdn.simpleicons.org/huggingface/FFD21E' },
            ]}
          />

          <Section
            title="Productivity"
            desc="Notes, tasks, wikis, and code — Bro works with your favourite tools."
            items={[
              { name: 'Apple Notes', desc: 'Native macOS/iOS notes', logo: 'https://cdn.simpleicons.org/apple/ffffff' },
              { name: 'Apple Reminders', desc: 'Native reminders', logo: 'https://cdn.simpleicons.org/apple/ffffff' },
              { name: 'Things 3', desc: 'GTD task manager', logo: 'https://cdn.simpleicons.org/things/ffffff' },
              { name: 'Obsidian', desc: 'Knowledge graph notes', logo: 'https://cdn.simpleicons.org/obsidian/7C3AED' },
              { name: 'Notion', desc: 'Workspace & databases', logo: 'https://cdn.simpleicons.org/notion/ffffff' },
              { name: 'Bear Notes', desc: 'Beautiful Markdown notes', logo: 'https://www.google.com/s2/favicons?domain=bear.app&sz=64' },
              { name: 'Trello', desc: 'Kanban boards', logo: 'https://cdn.simpleicons.org/trello/0052CC' },
              { name: 'GitHub', desc: 'Issues, PRs & code', logo: 'https://cdn.simpleicons.org/github/ffffff' },
            ]}
          />

          <Section
            title="Music & Audio"
            desc="Control playback, identify songs, and manage multi-room audio."
            items={[
              { name: 'Spotify', desc: 'Playback & playlists', logo: 'https://cdn.simpleicons.org/spotify/1DB954' },
              { name: 'Sonos', desc: 'Multi-room speakers', logo: 'https://cdn.simpleicons.org/sonos/ffffff' },
              { name: 'BluOS', desc: 'Hi-fi streaming', logo: 'https://www.google.com/s2/favicons?domain=bluos.net&sz=64' },
            ]}
          />

          <Section
            title="Smart Home"
            desc="Lights, thermostats, and IoT devices — all controllable via chat."
            items={[
              { name: 'Philips Hue', desc: 'Smart lighting', logo: 'https://cdn.simpleicons.org/philipshue/ffffff' },
              { name: '8Sleep', desc: 'Smart mattress', logo: 'https://cdn.simpleicons.org/eightsleep/ffffff' },
              { name: 'Home Assistant', desc: 'Home automation hub', logo: 'https://cdn.simpleicons.org/homeassistant/41BDF5' },
            ]}
          />

          <Section
            title="Tools & Automation"
            desc="Browser control, scheduled tasks, email triggers, and more."
            items={[
              { name: 'Browser', desc: 'Chrome/Chromium control', logo: 'https://cdn.simpleicons.org/googlechrome/4285F4' },
              { name: 'Cron', desc: 'Scheduled tasks', logo: 'https://cdn.simpleicons.org/clockify/ffffff' },
              { name: 'Gmail', desc: 'Email triggers & drafts', logo: 'https://cdn.simpleicons.org/gmail/EA4335' },
              { name: 'Webhooks', desc: 'HTTP integrations', logo: 'https://cdn.simpleicons.org/webhooks/ffffff' },
              { name: '1Password', desc: 'Secure credentials', logo: 'https://cdn.simpleicons.org/1password/3B66BC' },
              { name: 'Ghostwriter', desc: 'AI writing assistant', logo: 'https://www.google.com/s2/favicons?domain=ghostwriter.ai&sz=64' },
            ]}
          />

          <Section
            title="Media & Creative"
            desc="Generate images, capture screens, and find the perfect GIF."
            items={[
              { name: 'Image Gen', desc: 'DALL·E & Gemini', logo: 'https://cdn.simpleicons.org/openai/white', fallbackLogo: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64' },
              { name: 'GIF Search', desc: 'Tenor & Giphy', logo: 'https://cdn.simpleicons.org/giphy/FF6666' },
              { name: 'Screenshots', desc: 'Screen capture', logo: 'https://cdn.simpleicons.org/sharex/ffffff' },
              { name: 'Camera', desc: 'RTSP/ONVIF cameras', logo: 'camera-icon', isIcon: true },
            ]}
          />

          <Section
            title="Social"
            desc="Post tweets, manage email, and stay connected."
            items={[
              { name: 'Twitter / X', desc: 'Post & monitor', logo: 'https://cdn.simpleicons.org/x/ffffff' },
              { name: 'Gmail', desc: 'Read, draft & send', logo: 'https://cdn.simpleicons.org/gmail/EA4335' },
            ]}
          />

          <Section
            title="Platforms"
            desc="Run the gateway anywhere. Use companion apps for voice, camera, and native features."
            items={[
              { name: 'macOS', desc: 'Native Mac support', logo: 'https://cdn.simpleicons.org/apple/ffffff' },
              { name: 'Linux', desc: 'Server & desktop', logo: 'https://cdn.simpleicons.org/linux/ffffff' },
              { name: 'Windows', desc: 'WSL2 support', logo: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64' },
              { name: 'Docker', desc: 'Containerised deploy', logo: 'https://cdn.simpleicons.org/docker/2496ED' },
              { name: 'iOS', desc: 'Companion app', logo: 'https://cdn.simpleicons.org/apple/ffffff' },
              { name: 'Android', desc: 'Companion app', logo: 'https://cdn.simpleicons.org/android/3DDC84' },
            ]}
          />

          {/* CTA */}
          <div className="text-center mt-16 mb-8 p-8 rounded-2xl border border-border bg-secondary/20">
            <h2 className="text-xl font-semibold text-foreground mb-3">Ready to get started?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Try Bro free and connect your first integration in minutes.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p>© 2026 TalkToBro</p>
          <div className="flex items-center gap-4">
            <Link to="/crisis" className="hover:text-foreground transition-colors">Support</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Integrations;