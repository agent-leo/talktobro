const shoutouts = [
  { text: "It's running my company.", author: "therno", url: "https://x.com/therno/status/2014216984267780431" },
  { text: "A smart model with eyes and hands at a desk with keyboard and mouse. You message it like a coworker and it does everything a person could do with that Mac mini.", author: "nathanclark_", url: "https://x.com/nathanclark_/status/2014647048612773912" },
  { text: "Everything Siri was supposed to be. And it goes so much further.", author: "crossiBuilds", url: "https://x.com/crossiBuilds/status/2008478023826153665" },
  { text: "Named him Jarvis. Daily briefings, calendar checks, reminds me when to leave for pickleball based on traffic.", author: "BraydonCoyer", url: "https://x.com/BraydonCoyer/status/2008537198061379720" },
  { text: "A megacorp like Anthropic or OpenAI could not build this. Literally impossible with how corpo works.", author: "Dimillian", url: "https://x.com/Dimillian/status/2008446638172340398" },
  { text: "Feeling like Iron Man", author: "MahmoudAshraf93", url: "https://x.com/MahmoudAshraf93/status/2008249968155652457" },
  { text: "Not enterprise. Not hosted. Infrastructure you control. This is what personal AI should feel like.", author: "BioInfo", url: "https://x.com/BioInfo/status/2010115166315393370" },
  { text: "Processed our entire source of truth via WhatsApp in minutes, where RAG agents struggled for days.", author: "pocarles", url: "https://x.com/pocarles/status/2007925850562531676" },
  { text: "everything just worked first time and it combined tools in unexpected ways and even added skills and made edits to its own prompt that were hot-reloaded", author: "hey_zilla", url: "https://x.com/hey_zilla/status/2010450591815016601" },
  { text: "A glimpse into the future of how normal people will use AI.", author: "tysonhutchins_", url: "https://x.com/tysonhutchins_/status/2010046933893865701" },
  { text: "It will actually be the thing that nukes a ton of startups, not ChatGPT as people meme about. The fact that it's hackable and hostable on-prem will make sure tech like this DOMINATES conventional SaaS.", author: "rovensky", url: "https://x.com/rovensky/status/2010676669124612111" },
  { text: "Current level of open-source apps capabilities: does everything, connects to everything, remembers everything. It's all collapsing into one unique personal OS.", author: "jakubkrcmar", url: "https://x.com/jakubkrcmar/status/2011186102367814135" },
  { text: "im also a total non technical beginner so the CLI is a whole new interface for me but its super addictive - 2 am and Im still going.", author: "marvelgirl_eth", url: "https://x.com/marvelgirl_eth" },
  { text: "Took literally 5 mins to set everything up. Now it fetches directly from whoop and gives me updates, summaries.", author: "sharoni_k", url: "https://x.com/sharoni_k/status/2010306102148428286" },
  { text: "I'm literally on my phone in a telegram chat and it's communicating with codex cli on my computer creating detailed spec files while out on a walk with my dog. 🤯", author: "conradsagewiz", url: "https://x.com/conradsagewiz/status/2012954824631898300" },
  { text: "Wanted a way for it to have access to my courses at uni. Asked it to build a skill - it did and started using it on its own.", author: "pranavkarthik__", url: "https://x.com/pranavkarthik__/status/2009835051522162874" },
  { text: "I'm having a lot of fun with this and it's going to totally change the way I support my students learning how to vibe code!", author: "iamjohnellison", url: "https://x.com/iamjohnellison/status/2010623622847873342" },
  { text: "This is legit the only 'agent' that I have seen that's actually funny.", author: "LLMJunky", url: "https://x.com/LLMJunky/status/2010045556501164366" },
  { text: "Autonomous Claude Code loops from my phone. 'fix tests' via Telegram. Runs the loop, sends progress every 5 iterations.", author: "php100", url: "https://x.com/php100/status/2008791236526952790" },
  { text: "🦞 Is a whole new world! Like having super powers! Getting so much done while afk, it's mind blowing 🤯", author: "oneishaansharma", url: "https://x.com/oneishaansharma/status/2013067106322092131" },
  { text: "I asked it to take picture of the sky whenever it's pretty. It designed a skill and took a pic!", author: "signalgaining", url: "https://x.com/signalgaining/status/2010523120604746151" },
  { text: "It is one of the most delightful thing I've used in a few years.", author: "coyotevn", url: "https://x.com/coyotevn/status/2010270055985295529" },
  { text: "Essentially - you can automate almost anything you can do on the machine it sits on.", author: "aus_bytes", url: "https://x.com/aus_bytes/status/2010463830049161441" },
  { text: "Running fully locally off MiniMax 2.5 and can do the tool parsing for what I need!", author: "TheZachMueller", url: "https://x.com/TheZachMueller/status/2012668844842578213" },
  { text: "Catching fun vibes I haven't felt since I first got into computers 30 years ago.", author: "buddyhadry", url: "https://x.com/buddyhadry/status/2010005331925954739" },
  { text: "looks dope as an AI assistant love it's platform/os agnostic, trying right away", author: "SaidAitmbarek", url: "https://x.com/SaidAitmbarek/status/2010467696828453178" },
  { text: "I got my girlfriend on board earlier today and she seems hooked already.", author: "jandragsbaek", url: "https://x.com/jandragsbaek/status/2011581054206034300" },
  { text: "This is the best 'morning briefing' style interface I've seen, love it!", author: "aaronmakelky", url: "https://x.com/aaronmakelky/status/2010190236584947845" },
  { text: "What you've given to the world is nothing short of amazing.", author: "BitcoinPeace77", url: "https://x.com/BitcoinPeace77/status/2013064560992047412" },
  { text: "What a cool thing to have AI on call at your own computer.", author: "_KevinTang", url: "https://x.com/_KevinTang/status/2010914035550634494" },
  { text: "2026 is already the year of personal agents.", author: "chrisdietr", url: "https://x.com/chrisdietr/status/2010555854613803198" },
  { text: "TLDR; open source built a better version of Siri that Apple ($3.6 trillion company) was sleeping on for years.", author: "Hesamation", url: "https://x.com/Hesamation/status/2015110922159730971" },
  { text: "Remember when Siri was supposed to be the future? That future exists now. Self-hosted AI that actually remembers things, messages proactively, runs 24/7.", author: "velvet_shark", url: "https://x.com/velvet_shark/status/2009716334813434019" },
  { text: "Within an hour, had it monitoring my full release workflow — gh actions, npm publish — alerting me when done!", author: "shuv1337", url: "https://x.com/shuv1337/status/2008118863205113899" },
  { text: "Knew my voice, my weird abbreviations, my 2am panic debugging sessions. Made me feel like a real developer.", author: "xMikeMickelson", url: "https://x.com/xMikeMickelson/status/2009511137537126548" },
  { text: "Feels like the best buddy you always wanted. For me this is 'alpha AGI'.", author: "OliNorwell", url: "https://x.com/OliNorwell/status/2009205888482210149" },
  { text: "Daily calendar briefs, creates tasks in Basecamp via voice, preps me for meetings. Feels like a proactive co-pilot.", author: "benemredoganer", url: "https://x.com/benemredoganer/status/2009161859123884254" },
  { text: "A real glimpse into the personal AI-assistant future. Monitors my email, calendars, todos, and finances.", author: "jverdi", url: "https://x.com/jverdi/status/2007971745874206969" },
  { text: "Incredibly well-made, doesn't feel like slop, elegant docs.", author: "atzydev", url: "https://x.com/atzydev/status/2009117280848970208" },
  { text: "Pure magic. My mind is blown and can't stop playing with this.", author: "Abhay08", url: "https://x.com/Abhay08/status/2009639451824390560" },
  { text: "Most interesting real world application for LLMs right now.", author: "chrisdietr", url: "https://x.com/chrisdietr/status/2009118722695553363" },
  { text: "Fell for hype and installed it yesterday. Feels like I've grown back part of me I forgot I had.", author: "orange_boy", url: "https://x.com/orange_boy/status/2009743896973033759" },
  { text: "Instant love — how did I not know about this???", author: "mikehostetler", url: "https://x.com/mikehostetler/status/2010000827273134304" },
  { text: "Truly the best thing I've used in a long time.", author: "vallver", url: "https://x.com/vallver/status/2010028259770245334" },
  { text: "The best projects are a labor of love.", author: "MysticEru", url: "https://x.com/MysticEru/status/2010053430493278360" },
  { text: "Handling my emails, calendar events, tasks and can API into any other tools.", author: "heyitsyashu", url: "https://x.com/heyitsyashu/status/2008563498423591398" },
  { text: "Did not open an IDE, did not touch a terminal since last night.", author: "onusoz", url: "https://x.com/onusoz/status/2008456860580397437" },
  { text: "This shit is amazing!", author: "chrisrodz35", url: "https://x.com/chrisrodz35/status/2009431826117378529" },
  { text: "Feels like we're living in the future.", author: "Philo01", url: "https://x.com/Philo01/status/2011214857614606435" },
  { text: "AGI is a lobster, it will never sink!", author: "FrancisBrero", url: "https://x.com/FrancisBrero/status/2012317589117247782" },
  { text: "Lol, this is hilarious, troubling, and awesome.", author: "mike_kasberg", url: "https://x.com/mike_kasberg/status/2012314819819348259" },
  { text: "This lobster is gonna take over the world.", author: "alex_here_now", url: "https://x.com/alex_here_now/status/2010473539514904746" },
];

const half = Math.ceil(shoutouts.length / 2);
const row1 = shoutouts.slice(0, half);
const row2 = shoutouts.slice(half);

function Avatar({ username }: { username: string }) {
  return (
    <img
      src={`https://unavatar.io/x/${username}`}
      alt={`@${username}`}
      className="w-8 h-8 rounded-full bg-muted shrink-0 object-cover"
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function ShoutoutCard({ text, author, url }: { text: string; author: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-[320px] p-5 rounded-xl border border-border/60 bg-card hover:bg-secondary/40 transition-colors"
    >
      <p className="text-sm text-foreground leading-relaxed mb-3">"{text}"</p>
      <div className="flex items-center gap-2">
        <Avatar username={author} />
        <p className="text-xs text-muted-foreground font-medium">@{author}</p>
      </div>
    </a>
  );
}

export function Shoutouts() {
  return (
    <section className="mb-12 space-y-3 animate-fade-in-delay-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">What people say</h2>
      </div>

      <div className="overflow-hidden space-y-3">
        {/* Row 1 — scrolls left */}
        <div className="marquee-row">
          <div className="marquee-track marquee-left">
            {[...row1, ...row1].map((s, i) => (
              <ShoutoutCard key={`r1-${i}`} {...s} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="marquee-row">
          <div className="marquee-track marquee-right">
            {[...row2, ...row2].map((s, i) => (
              <ShoutoutCard key={`r2-${i}`} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
